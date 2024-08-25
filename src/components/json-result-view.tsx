import { useTemplateStore } from "@/store/template-store";
import JsonView from "@uiw/react-json-view";
import { monokaiTheme } from "@uiw/react-json-view/monokai";
import { useState } from "react";

function JsonResultView({ objectResult }: { objectResult: any }) {
  const [copied, setCopied] = useState(false);

  const { selectedTemplate } = useTemplateStore();

  if (!objectResult) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px] bg-[#272822] text-[#f8f8f2] font-bold rounded-lg p-6 shadow-md">
        <div className="text-center">
          <p>Create your template and extract your data</p>
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(objectResult, null, 2),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to copy JSON to clipboard:", err);
      // eslint-disable-next-line no-alert
      alert("Failed to copy JSON to clipboard:");
    }
  };

  const handleDownload = () => {
    const jsonString = JSON.stringify(objectResult, null, 2);
    const blob       = new Blob([jsonString], { type: "application/json" });
    const url        = URL.createObjectURL(blob);
    const link       = document.createElement("a");
    link.href        = url;
    link.download    = `${selectedTemplate?.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="">
      <div className="flex space-x-2 justify-end mb-3">
        <button
          type="button"
          onClick={ handleCopy }
          className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 focus:outline-none"
        >
          { copied ? "Copied!" : "Copy JSON" }
        </button>
        <button
          type="button"
          onClick={ handleDownload }
          className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 focus:outline-none"
        >
          Download JSON
        </button>
      </div>
      <JsonView value={ objectResult } style={ monokaiTheme } />
    </div>
  );
}

export default JsonResultView;
