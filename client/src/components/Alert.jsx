export default function Alert({ message }) {
  if (!message) return null;

  return (
    <div className="bumpd-alert">
      <span className="bumpd-alert-icon">💔</span>
      <span>{message}</span>
    </div>
  );
}
