// Called from playground feature
import { padSequences, pageRank, STOP_WORDS, Tokenizer } from "./ml-lib";
import * as use from "@tensorflow-models/universal-sentence-encoder";
import * as tf from "@tensorflow/tfjs";
export async function run(jsonData: string): Promise<any | null> {
    // Preparing data from json file
    const jsonArr = jsonData.split("\n");
    const labels: number[] = [];
    const sentences: string[] = [];
    for (let j of jsonArr) {
        if (j.trim() !== "") {
            let o = JSON.parse(j);
            o = o as { headline: string; is_sarcastic: number };
            labels.push(o["is_sarcastic"]);

            let tokenizedSentence = Tokenizer.tokenize(o["headline"]);
            let filtered = [];
            for (const word of tokenizedSentence) {
                const w = word.toLowerCase();
                if (STOP_WORDS.findIndex((el) => el === w) === -1) {
                    filtered.push(w);
                }
            }
            sentences.push(filtered.join(" "));
        }
    }

    // Preparing training & testing dataset
    const TRAINING_SIZE = 10000;
    const TEST_SIZE = 1000;
    const trainingSentences = sentences.slice(0, TRAINING_SIZE);
    const trainingLabels = labels.slice(0, TRAINING_SIZE);
    const testSentences = sentences.slice(TRAINING_SIZE, TRAINING_SIZE + TEST_SIZE);
    const testLabels = labels.slice(TRAINING_SIZE, TRAINING_SIZE + TEST_SIZE);

    const VOCAB_SIZE = 2000;
    const MAX_LEN = 10;
    const tokenizer = new Tokenizer(VOCAB_SIZE, "<OOV>");
    tokenizer.fitOnTexts(trainingSentences);
    const trainingSequences = tokenizer.textsToSequences(trainingSentences);
    const trainingPadded = padSequences(trainingSequences, MAX_LEN, "post", "post");

    // Inspecting
    // console.log([...tokenizer.wordsIndex].slice(0, 20));
    // console.log(trainingSentences[0]);
    // console.log(trainingSequences[0]);
    // console.log(trainingPadded[0]);

    const model = tf.sequential();
    model.add(
        tf.layers.embedding({
            inputDim: VOCAB_SIZE,
            outputDim: 7,
        })
    );
    model.add(tf.layers.globalAveragePooling1d({}));
    model.add(
        tf.layers.dense({
            units: 8,
            activation: "relu",
            kernelRegularizer: tf.regularizers.l2({
                l2: 0.01,
            }),
        })
    );
    model.add(
        tf.layers.dense({
            units: 1,
            activation: "sigmoid",
        })
    );

    // const adam = tf.train.adam(0.0001, 0.9, 0.999);
    model.compile({
        loss: "binaryCrossentropy",
        optimizer: "adam",
        metrics: ["accuracy"],
    });

    const history = await model.fit(tf.tensor(trainingPadded), tf.tensor(trainingLabels), {
        epochs: 1,
    });
    console.log(history);

    const predictSentences = [
        "granny starting to fear spiders in the garden might be real",
        "game of thrones season finale showing this sunday night",
        "TensorFlow book will be a best seller",
    ];

    const _seqs = tokenizer.textsToSequences(predictSentences);
    const _pads = padSequences(_seqs, MAX_LEN, "post", "post");
    const val = model.predict(tf.tensor(_pads)) as tf.Tensor;
    val.print();

    return null;
    const wordCounts = [...tokenizer.wordsCounter].sort((a, b) => b[1] - a[1]);
    const xs: number[] = [];
    const ys: number[] = [];
    let i = 0;
    for (const [word, freq] of wordCounts) {
        i += 1;
        xs.push(i);
        ys.push(freq);
    }
    return {
        x: xs,
        y: ys,
    };
}

/**
 * TODO: test for pageRank. Similiarity function, w/ approx & exact normalization
 */
let useModel: use.UniversalSentenceEncoder | null = null;
export async function extractKeywords(fullText: string, tops: number = 3) {
    // Load the model.
    if (useModel === null) {
        console.log("loading models");
        useModel = await use.load();
    }
    const tokenizer = (useModel as any).tokenizer;

    // Preparing data

    const sentences = Tokenizer.sentenceTokenize(fullText);
    console.log(sentences);
    if (!sentences) {
        throw new Error("Texts cannot be tokenized into sentences.");
    }
    const sentenceEmbeddings = await useModel.embed(sentences);

    const similarityMatrix = tf.tidy(() => {
        return tf
            .matMul(sentenceEmbeddings as any, sentenceEmbeddings as any, false, true)
            .arraySync();
    }) as number[][];
    sentenceEmbeddings.dispose();
    console.log(tf.memory());

    let ranks = pageRank(similarityMatrix).map((v, idx) => [v, idx]);
    console.log(ranks);
    ranks.sort((a, b) => b[0] - a[0]);
    const topSentences = ranks
        .slice(0, tops)
        .map((v) => [v[1], sentences[v[1]]])
        .sort((a: any, b: any) => a[0] - b[0]);
    return {
        similiarityMatrix: similarityMatrix,
        topSentences: topSentences,
    };
}
