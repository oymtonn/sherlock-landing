export default function DashboardLoading() {
  return (
    <section className="auth-section">
      <div className="wrap">
        <div className="panel auth-panel">
          <div className="panel-bar">
            <span className="panel-dots">
              <i />
              <i />
              <i />
            </span>
            <span>sherlock — dashboard</span>
          </div>
          <div className="auth-panel-body">
            <p className="mono auth-loading">loading your connection…</p>
          </div>
        </div>
      </div>
    </section>
  );
}
