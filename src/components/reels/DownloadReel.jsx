import { useState } from "react";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import toast from "react-hot-toast";

const ReelDownloader = ({ reel }) => {
    const [progress, setProgress] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        setSuccess(false);
        setProgress(0);

        try {
            const response = await fetch(reel.videoUrl);

            const reader = response.body.getReader();
            const contentLength = +response.headers.get("Content-Length");
            let receivedLength = 0;
            let chunks = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                receivedLength += value.length;
                setProgress(Math.round((receivedLength / contentLength) * 100));
            }

            const blob = new Blob(chunks);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `fuoye_reel_${reel.id}.mp4`;
            link.click();
            URL.revokeObjectURL(url);

            // setSuccess(true);
            toast.success("Download completed!");
        } catch (err) {
            toast.error("Download failed!");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto mt-4">


            <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                onClick={handleDownload}
            >
                <Download className="h-5 w-5" />
            </Button>

            {downloading && (
                <div className="mt-2 w-full h-[4px] bg-gray-300 rounded overflow-hidden">
                    <div
                        className="bg-green-500 h-[4px] transition-all duration-200"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
};

export default ReelDownloader;
