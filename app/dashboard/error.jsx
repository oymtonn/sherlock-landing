"use client";

export default function DashboardError({ reset }) {
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
            <span className="chip chip-red">something broke</span>
            <h1>We hit a snag</h1>
            <p>Something went wrong while loading the dashboard. Please try again.</p>
            <div className="auth-panel-actions">
              <button type="button" className="btn btn-primary" onClick={reset}>
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
