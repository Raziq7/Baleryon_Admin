import Button from "../ui/button/Button";

export default function DownloadReportButton() {
  const handleDownload = () => {
    window.open(
      "/api/admin/reports/download",
      "_blank"
    );
  };

  return (
    <Button
      onClick={handleDownload}
    >
      Download Excel
    </Button>
  );
}