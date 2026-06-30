export default function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(249, 245, 246, 0.75)",
        backdropFilter: "blur(2px)",
        zIndex: 9999,
        paddingBottom: "80px",
        paddingRight: "32px",
      }}
    >
      <div className="cssload-main" style={{ left: 0, transform: "none" }}>
        <div className="cssload-heart">
          <span className="cssload-heartL"></span>
          <span className="cssload-heartR"></span>
          <span className="cssload-square"></span>
        </div>
        <div className="cssload-shadow"></div>
      </div>
    </div>
  );
}
