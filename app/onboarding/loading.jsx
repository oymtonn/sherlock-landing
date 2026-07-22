export default function OnboardingLoading() {
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
            <span>sherlock — onboarding</span>
          </div>
          <div className="auth-panel-body">
            <p className="mono auth-loading">checking your GitHub connection…</p>
          </div>
        </div>
      </div>
    </section>
  );
}
