export default function CommissionerPanel() {
  return (
    <div className="fixed inset-0 top-0 left-0 w-full h-full z-50">
      <iframe
        src="/admin-panel.html"
        title="Commissioner Control Panel"
        className="w-full h-full border-0"
        style={{ display: "block" }}
      />
    </div>
  );
}
