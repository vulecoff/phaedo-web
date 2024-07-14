import { sum, without } from "lodash-es";
import * as math from "mathjs";

export class Tokenizer {
    private _maxWords: number;
    private _oovToken: string | null = null;

    private _wordsCounter = new Map<string, number>();
    private _wordsIndex = new Map<string, number>();
    // private wordDocs = new Map<string, number>();
    constructor(maxWords: number, oovToken?: string) {
        this._maxWords = maxWords;
        if (oovToken) {
            this._oovToken = oovToken;
        }
    }

    /**
     * Split on everything except alphanumeric characters (& underscore).
     * Remove all punctuation.
     * Requires sanitizing beforehand, i.e. removes html tags.
     * @param s
     */
    static tokenize(s: string) {
        const regex = /[^A-Za-z0-9_]+/;
        const res = s.split(regex);
        return without(res, " ", "");
    }

    /**
     * https://github.com/NaturalNode/natural/blob/master/lib/natural/tokenizers/sentence_tokenizer.js
     * @param s
     */
    static sentenceTokenize(s: string): string[] | null {
        const regex = /(?<=\s+|^)["'‘“'"[({⟨]?(.*?[.?!…]|.+)(\s[.?!…])*["'’”'"\])}⟩]?(?=\s+|$)/g;
        let tokens: any = s.match(regex);
        if (!tokens) {
            return null;
        }
        tokens = (tokens as string[]).map((t) => t.trim());
        return without(tokens, "");
    }

    /**
     * Create word index based on words in corpus.
     * Sorted by frequency, words are auto-converted to lowercase.
     * @param corpusSentences
     */
    fitOnTexts(corpusSentences: string[]) {
        for (const sentence of corpusSentences) {
            const tokenized = Tokenizer.tokenize(sentence);
            for (let word of tokenized) {
                word = word.toLowerCase();
                if (!this._wordsCounter.has(word)) {
                    this._wordsCounter.set(word, 1);
                }
                const _cnt = this._wordsCounter.get(word);
                this._wordsCounter.set(word, _cnt! + 1);
            }
        }
        const sortedWordsCnt = [...this._wordsCounter.entries()].sort((a, b) => b[1] - a[1]);
        if (this._oovToken) {
            // OOV token has an index of 1
            sortedWordsCnt.splice(0, 0, [this._oovToken, 1]);
        }
        for (let i = 0; i < sortedWordsCnt.length; i++) {
            const idx = i + 1; // reserve index 0
            const w = sortedWordsCnt[i][0];
            this._wordsIndex.set(w, idx);
        }
    }

    /**
     * Return the most common (maxWords - 1) words.
     * 0 idx preserved for padding.
     * TODO: generator, beware with large texts.
     * @param texts
     */
    textsToSequences(texts: string[]) {
        const sequences = [];
        const oovIndex = this._oovToken ? this._wordsIndex.get(this._oovToken) : null;
        for (const sentence of texts) {
            const tokenized = Tokenizer.tokenize(sentence);
            const seq: number[] = [];
            for (let word of tokenized) {
                word = word.toLowerCase();
                const idx = this._wordsIndex.get(word);
                if (idx && idx < this._maxWords) {
                    seq.push(idx);
                } else if (oovIndex) {
                    seq.push(oovIndex);
                }
            }
            sequences.push(seq);
        }
        return sequences;
    }

    /**
     * Note: for performance, currently returns a reference.
     */
    get wordsIndex(): Map<string, number> {
        return this._wordsIndex;
    }
    /**
     * Return the whole words count reference.
     */
    get wordsCounter(): Map<string, number> {
        return this._wordsCounter;
    }
}

/**
 * Note: malcious js injection.
 * TODO: Also needed to escape special characters
 * @param html
 * @returns
 */
export const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || "";
};

export const padSequences = (
    sequences: number[][],
    maxLength: number,
    truncType: "pre" | "post",
    padType: "pre" | "post"
) => {
    const resSeqs: number[][] = [];
    for (const seq of sequences) {
        let res = seq;
        if (seq.length > maxLength) {
            if (truncType === "pre") {
                res = seq.slice(seq.length - maxLength);
            } else if (truncType === "post") {
                res = seq.slice(0, maxLength);
            }
        } else if (seq.length < maxLength) {
            const zeroes = new Array(maxLength - seq.length).fill(0);
            if (padType === "pre") {
                res = zeroes.concat(seq);
            } else if (padType === "post") {
                res = seq.concat(zeroes);
            }
        }
        resSeqs.push(res);
    }
    return resSeqs;
};

/**
 * https://networkx.org/documentation/stable/_modules/networkx/algorithms/link_analysis/pagerank_alg.html#pagerank
 * https://pi.math.cornell.edu/~mec/Winter2009/RalucaRemus/Lecture3/lecture3.html
 * @param graphMatrix
 */
export const pageRank = (graphMatrix: number[][]): number[] => {
    //
    const N = graphMatrix.length;
    if (!N) {
        return new Array<number>();
    }
    // allows no self-loop. Does this matter?
    for (let i = 0; i < N; i++) {
        graphMatrix[i][i] = 0;
    }

    const rowsSumNormalized = graphMatrix.map((row) => {
        const s = sum(row);
        return s === 0 ? s : 1 / s;
    });
    const graphMatrixNormalized = graphMatrix.map((row) => {
        const s = sum(row);
        return row.map((v) => (s === 0 ? 0 : v / s));
    });
    // console.log(
    //     "Inspecting graph matrix normalized, sum of its rows",
    //     graphMatrixNormalized.map((row) => sum(row))
    // );
    let ranks = new Array(N).fill(1 / N); // initial ranks
    let isDanglings = rowsSumNormalized.map((s) => s === 0);
    const danglingWeight = 1 / N;

    const alpha = 0.85;
    const maxIter = 100;
    for (let iter = 0; iter < maxIter; iter++) {
        const lastRanks = ranks;
        const danglingRedistribution = sum(ranks.map((x, idx) => (isDanglings[idx] ? x : 0)));
        ranks = math.add(
            math.multiply(
                alpha,
                math.add(
                    math.multiply(ranks as any, graphMatrixNormalized as any),
                    new Array(N).fill(danglingRedistribution * danglingWeight)
                )
            ),
            new Array(N).fill((1 / N) * (1 - alpha))
        ) as any;
        const err = ranks.reduce((prev, v, i) => Math.abs(v - lastRanks[i] + prev), 0);
        if (err < 1e-5) {
            return ranks;
        }
    }
    throw new Error(`Power iteration failed to converge after ${maxIter} iterations.`);
};

export const STOP_WORDS = [
    "i",
    "me",
    "my",
    "myself",
    "we",
    "our",
    "ours",
    "ourselves",
    "you",
    "your",
    "yours",
    "yourself",
    "yourselves",
    "he",
    "him",
    "his",
    "himself",
    "she",
    "her",
    "hers",
    "herself",
    "it",
    "its",
    "itself",
    "they",
    "them",
    "their",
    "theirs",
    "themselves",
    "what",
    "which",
    "who",
    "whom",
    "this",
    "that",
    "these",
    "those",
    "am",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "having",
    "do",
    "does",
    "did",
    "doing",
    "a",
    "an",
    "the",
    "and",
    "but",
    "if",
    "or",
    "because",
    "as",
    "until",
    "while",
    "of",
    "at",
    "by",
    "for",
    "with",
    "about",
    "against",
    "between",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "to",
    "from",
    "up",
    "down",
    "in",
    "out",
    "on",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "s",
    "t",
    "can",
    "will",
    "just",
    "don",
    "should",
    "now",
];
