import { useState } from "react";

const ISSUE_TYPES = [
  "Bug or error",
  "Inappropriate content",
  "Account problem",
  "Feature request",
  "Other",
] as const;

interface ReportModalProps {
  storyId: string;
  storyTitle: string;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({
  storyId,
  storyTitle,
  onClose,
}) => {
  const [issueType, setIssueType] = useState<string>("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!issueType || !message.trim()) {
      setError("Please select an issue type and write a message.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASEURL}/api/auth/support`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            issueType,
            message: message.trim(),
            storyId,
            storyTitle,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Submission failed");
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Report Story</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-700 font-medium">
              Thank you! Your report has been received.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="mt-4 px-5 py-2 bg-[#00B8AE] text-white rounded-lg text-sm font-medium hover:bg-[#009e95] transition"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Reporting:{" "}
              <span className="font-medium text-gray-700">{storyTitle}</span>
            </p>

            {/* Issue Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Type <span className="text-red-500">*</span>
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B8AE]/50"
              >
                <option value="">Select an issue type…</option>
                {ISSUE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="Describe the issue in detail…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#00B8AE]/50"
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {message.length}/2000
              </p>
            </div>

            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 text-sm bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit Report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
