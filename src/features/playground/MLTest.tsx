import { useEffect, useState } from "react";
import { Button } from "../../components/button/Button.tsx";
import { extractKeywords, run } from "../../lib/ml.ts";
import { pageRank, Tokenizer } from "../../lib/ml-lib.ts";

export function MLTest() {
    const [jsonData, setJsonData] = useState<string | null>(null);
    const [Plotly, setPlotly] = useState<any | null>(null);
    const [text, setText] = useState("");
    const [summary, setSummary] = useState("");
    useEffect(() => {
        const el = document.createElement("script");
        el.src = "https://cdn.plot.ly/plotly-2.33.0.min.js";
        el.async = true;
        document.body.appendChild(el);
        el.onload = (e) => {
            setPlotly((window as any).Plotly);
        };
        return () => {
            document.body.removeChild(el);
        };
    }, []);

    async function handleRun() {
        const { similiarityMatrix, topSentences } = await extractKeywords(text, 5);
        console.log(topSentences);
        setSummary(topSentences.map((v) => v[1]).join(" "));
        Plotly.newPlot("chart", [
            {
                z: similiarityMatrix,
                type: "heatmap",
            },
        ]);
    }

    function readFile(e: React.ChangeEvent<HTMLInputElement>) {
        const fileUrl = e.target.files?.[0];
        if (!fileUrl) {
            return;
        }
        const fileReader = new FileReader();
        fileReader.readAsText(fileUrl);
        fileReader.onload = () => {
            setJsonData(fileReader.result as string);
        };
        fileReader.onerror = () => {
            console.error(fileReader.error);
        };
    }

    return (
        <div className="flex flex-col place-items-center gap-2">
            Playground
            <Button
                onClick={() => {
                    window.location.reload();
                }}
            >
                Refresh page
            </Button>
            <Button onClick={() => handleRun()}>Run</Button>
            <input type="file" onChange={(e) => readFile(e)} />
            <textarea value={text} onChange={(e) => setText(e.target.value)}></textarea>
            <div id="chart" className="mt-4"></div>
            <p className="p-4">{summary}</p>
        </div>
    );
}
