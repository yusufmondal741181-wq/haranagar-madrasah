export default function About() {
  return (
    <div className="container" style={{ padding: '3rem 1.25rem' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        <h2 className="institution-brand" style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
          About Haranagar Chandipur Senior Madrasah
        </h2>
        <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '2rem' }}>Established in 1966</p>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>Institutional History</h3>
          <p style={{ marginBottom: '1rem' }}>
            Haranagar Chandipur Senior Madrasah was founded in 1966 with the singular objective of imparting qualitative, value-oriented education to students from all walks of life. Over decades of dedicated service, the institution has stood as a beacon of academic endeavor and discipline.
          </p>
          <p>
            The Madrasah integrates standard state curriculum requirements with high ethical standards to prepare students for both higher academic pursuits and responsible citizenship.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>Our Mission</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              To provide an inclusive, rigorous educational environment that inspires academic achievement, moral responsibility, and leadership qualities among learners.
            </p>
          </div>
          <div className="card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>Our Vision</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              To emerge as an institution of benchmark excellence in secondary and senior education by harmonizing traditional moral values with contemporary scientific learning.
            </p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>Message from the Head of the Institution</h3>
          <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
            "Welcome to Haranagar Chandipur Senior Madrasah. Since our foundation in 1966, our staff, managing committee, and community have strived to nurture each student's unique intellect. We remain steadfast in cultivating discipline, academic diligence, and mutual respect."
          </p>
          <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Headmaster / Superintendent</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Haranagar Chandipur Senior Madrasah</p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>Campus & Facilities</h3>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
            <li>Spacious and well-ventilated academic classrooms</li>
            <li>Institutional library holding classical, reference, and syllabus textbooks</li>
            <li>Designated science lab resources and digital educational aids</li>
            <li>Separate playground facilities and co-curricular recreational zones</li>
            <li>Clean drinking water, sanitation facilities, and continuous administrative supervision</li>
          </ul>
        </div>
      </div>
    </div>
  );
}