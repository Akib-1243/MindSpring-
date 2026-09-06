import { useCallback, useEffect, useState } from 'react'
import './App.css'

const schools = [['01', 'Computing & Data', 'Build intelligent systems for a changing world.'], ['02', 'Business & Leadership', 'Turn insight into responsible, practical impact.'], ['03', 'Health & Life Sciences', 'Improve lives through evidence and curiosity.']]
const researchAreas = ['Artificial intelligence', 'Sustainable futures', 'Digital society', 'Human performance']

function FacultyLogin() {
    const [error, setError] = useState('')

    return <div className="faculty-page">
        <a className="back-link" href="/">← Back to Relavanet Uni</a>
        <div className="faculty-login-wrap">
            <div className="faculty-intro"><div className="eyebrow"><span className="eyebrow-dot" /> RELAVANET UNIVERSITY · FACULTY SERVICES</div><h1>Make every<br /><em>question</em> count.</h1><p>Access the Academic Quality Control Suite to compare syllabi, review assessment risk, and build stronger learning experiences.</p><div className="faculty-note"><strong>Faculty portal</strong><span>Secure workspace for curriculum teams and teaching staff.</span></div></div>
            <form className="faculty-form" onSubmit={async (event) => { event.preventDefault(); setError(''); const form = new FormData(event.currentTarget); try { const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/faculty/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) }); if (!response.ok) throw new Error('Invalid faculty credentials.'); const data = await response.json(); localStorage.setItem('relavanet_token', data.token); window.location.href = '/faculty-dashboard' } catch (requestError) { setError(requestError.message) } }}><div className="section-label">/ SIGN IN</div><h2>Welcome back.</h2><p>Use your university credentials to continue.</p><label>University email<input name="email" type="email" placeholder="name@relavanet.edu" required /></label><label>Password<input name="password" type="password" placeholder="Enter your password" required /></label><div className="form-row"><label className="check-label"><input type="checkbox" /> Remember me</label><a href="mailto:it@relavanet.edu">Need help?</a></div><button className="primary-button" type="submit">Enter faculty portal <span>↗</span></button>{error && <div className="form-error">{error}</div>}</form>
        </div>
    </div>
}

function FacultyChat({ api = import.meta.env.VITE_API_URL || 'http://localhost:8000/api', token = localStorage.getItem('relavanet_token') }) {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([{ role: 'assistant', text: 'Ask me about curriculum alignment, assessment quality, or exam design.' }])
    const [loading, setLoading] = useState(false)
    const startNewSession = () => { setMessages([{ role: 'assistant', text: 'Ask me about curriculum alignment, assessment quality, or exam design.' }]); setMessage(''); setLoading(false); setOpen(false) }

    const sendMessage = async (event) => {
        event.preventDefault()
        const trimmedMessage = message.trim()
        if (!trimmedMessage || loading) return
        setMessages((current) => [...current, { role: 'user', text: trimmedMessage }])
        setMessage('')
        setLoading(true)
        try {
            const response = await fetch(`${api}/faculty/chat`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ message: trimmedMessage }) })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'The assistant could not respond.')
            setMessages((current) => [...current, { role: 'assistant', text: data.reply }])
        } catch (requestError) {
            setMessages((current) => [...current, { role: 'assistant', text: requestError.message }])
        } finally {
            setLoading(false)
        }
    }

    return <div className={`faculty-chat ${open ? 'is-open' : ''}`}>
        {open && <section className="faculty-chat-panel" aria-label="Faculty AI assistant">
            <header className="faculty-chat-header"><div><span className="chat-spark">✦</span><div><strong>Faculty assistant</strong><small>Powered by gpt-4o-mini</small></div></div><div className="faculty-chat-actions"><button type="button" onClick={() => setOpen(false)} aria-label="Minimize assistant" title="Minimize">−</button><button type="button" onClick={startNewSession} aria-label="Exit and start a new session" title="Exit session">×</button></div></header>
            <div className="faculty-chat-messages">{messages.map((item, index) => <div className={`chat-message ${item.role}`} key={`${item.role}-${index}`}>{item.text}</div>)}{loading && <div className="chat-message assistant chat-loading">Thinking<span>...</span></div>}</div>
            <form className="faculty-chat-form" onSubmit={sendMessage}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask a faculty question..." aria-label="Message the faculty assistant" /><button type="submit" disabled={loading || !message.trim()} aria-label="Send message">↗</button></form>
        </section>}
        <button className="faculty-chat-launcher" type="button" onClick={() => setOpen((current) => !current)} aria-label={open ? 'Minimize faculty assistant' : 'Open faculty assistant'}><span>{open ? '−' : '✦'}</span></button>
    </div>
}

function FacultyDashboard() {
    const [courses, setCourses] = useState([])
    const [tool, setTool] = useState('exam')
    const [history, setHistory] = useState({ exams: [], syllabi: [] })
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const api = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    const token = localStorage.getItem('relavanet_token')

    const loadDashboard = useCallback(() => fetch(`${api}/faculty/dashboard`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }).then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load faculty data.'))).then((data) => { setCourses(data.courses || []); setHistory({ exams: data.recent_exam_analyses || [], syllabi: data.recent_syllabus_analyses || [] }) }).catch((requestError) => setError(requestError.message)), [api, token])

    useEffect(() => { if (token) loadDashboard() }, [loadDashboard, token])

    const analyze = async (event) => { event.preventDefault(); setError(''); setResult(null); const form = new FormData(event.currentTarget); const endpoint = tool === 'exam' ? '/faculty/exam/analyze' : '/faculty/syllabus/analyze'; const payload = tool === 'exam' ? { course_id: form.get('course_id'), new_question: form.get('new_question') } : { course_a_id: form.get('course_a_id'), course_b_id: form.get('course_b_id') }; const response = await fetch(`${api}${endpoint}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const data = await response.json(); if (!response.ok) { setError(data.message || 'The analysis could not be completed.'); return } setResult({ type: tool, data }); await loadDashboard() }

    const courseName = (id) => courses.find((course) => course.id === id)?.code || 'Course'

    return <div className="dashboard-page"><header className="dashboard-header"><a className="brand" href="/"><span className="brand-mark">R</span><span>relavanet<span className="brand-light">uni</span></span></a><div><span className="faculty-status">FACULTY WORKSPACE</span><button className="logout-link" onClick={() => { localStorage.removeItem('relavanet_token'); window.location.href = '/faculty-login' }}>Sign out</button></div></header><main className="dashboard-main"><div className="dashboard-intro"><div className="section-label">/ ACADEMIC QUALITY CONTROL SUITE</div><h1>Good morning,<br /><em>faculty.</em></h1><p>Make assessment decisions with a clearer view of curriculum overlap, alignment, and risk.</p></div><div className="tool-switcher"><button className={tool === 'exam' ? 'active' : ''} onClick={() => { setTool('exam'); setResult(null) }}><span>01</span><strong>Exam forensics</strong><small>Check originality and syllabus alignment.</small></button><button className={tool === 'syllabus' ? 'active' : ''} onClick={() => { setTool('syllabus'); setResult(null) }}><span>02</span><strong>Syllabus duet</strong><small>Find overlap and strategic edges.</small></button></div><form className="analysis-form" onSubmit={analyze}><div className="section-label">/ {tool === 'exam' ? 'NEW FORENSIC ANALYSIS' : 'NEW SYLLABUS COMPARISON'}</div>{tool === 'exam' ? <><label>Course<select name="course_id" required><option value="">Select a course</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.code} · {course.name}</option>)}</select></label><label>New exam question<textarea name="new_question" rows="5" placeholder="Paste the question you want to audit..." required /></label></> : <div className="course-pair"><label>Source A<select name="course_a_id" required><option value="">Select a course</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.code} · {course.name}</option>)}</select></label><label>Source B<select name="course_b_id" required><option value="">Select a course</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.code} · {course.name}</option>)}</select></label></div>}<button className="primary-button" type="submit">Run analysis <span>↗</span></button>{error && <p className="analysis-error">{error}</p>}</form>{result && <AnalysisResult result={result} courseName={courseName} />}<section className="history-section"><div className="history-heading"><div><div className="section-label">/ SAVED REPORTS</div><h2>Recent analysis</h2></div><span>{history.exams.length + history.syllabi.length} reports</span></div><div className="history-grid">{history.exams.map((analysis) => <button className="history-card" key={`exam-${analysis.id}`} onClick={() => { setTool('exam'); setResult({ type: 'exam', data: analysis }) }}><span className="history-type">EXAM FORENSICS</span><strong>{analysis.overall_verdict}</strong><small>{courseName(analysis.course_id)} · {analysis.created_at?.slice(0, 10)}</small><div className="mini-scores"><span>Similarity <b>{analysis.similarity_score}%</b></span><span>Coverage <b>{analysis.syllabus_coverage_score}%</b></span></div></button>)}{history.syllabi.map((analysis) => <button className="history-card" key={`syllabus-${analysis.id}`} onClick={() => { setTool('syllabus'); setResult({ type: 'syllabus', data: analysis }) }}><span className="history-type">SYLLABUS DUET</span><strong>{analysis.overlaps?.length || 0} overlaps found</strong><small>{analysis.course_a?.code || 'Source A'} + {analysis.course_b?.code || 'Source B'} · {analysis.created_at?.slice(0, 10)}</small><div className="mini-scores"><span>Unique A <b>{analysis.unique_to_a?.length || 0}</b></span><span>Unique B <b>{analysis.unique_to_b?.length || 0}</b></span></div></button>)}{history.exams.length + history.syllabi.length === 0 && <p className="empty-history">No saved reports yet. Run an analysis to create the first one.</p>}</div></section></main></div>
}

function AnalysisResult({ result, courseName }) {
    const analysis = result.data
    if (result.type === 'syllabus') return <section className="result-panel"><div className="section-label">/ SYLLABUS DUET RESULT</div><h2>{analysis.overlaps?.length || 0} shared concepts found</h2><p>{analysis.strategic_advice}</p><div className="result-columns"><div><small>UNIQUE TO {analysis.course_a?.code || 'SOURCE A'}</small>{(analysis.unique_to_a || []).map((item) => <span className="result-tag" key={item}>{item}</span>)}</div><div><small>UNIQUE TO {analysis.course_b?.code || 'SOURCE B'}</small>{(analysis.unique_to_b || []).map((item) => <span className="result-tag" key={item}>{item}</span>)}</div></div></section>
    return <section className="result-panel"><div className="section-label">/ FORENSIC RESULT · {courseName(analysis.course_id)}</div><div className="result-verdict"><div><h2>{analysis.overall_verdict}</h2><p>{analysis.new_question}</p></div><div className="result-score"><strong>{analysis.syllabus_coverage_score}%</strong><small>syllabus alignment</small></div></div><div className="result-columns"><div><small>REUSE SIMILARITY</small><strong className="large-score">{analysis.similarity_score}%</strong></div><div><small>RISK FLAGS</small>{(analysis.risk_flags || []).length ? analysis.risk_flags.map((flag) => <span className="risk-flag" key={flag}>{flag}</span>) : <span className="clear-flag">No risk flags detected.</span>}</div></div></section>
}

function App() {
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')), { threshold: 0.14 })
        document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    if (window.location.pathname === '/faculty-login') return <FacultyLogin />
    if (window.location.pathname === '/faculty-dashboard') return <><FacultyDashboard /><FacultyChat /></>

    const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })

    return <div className="site-shell">
        <nav className="nav container">
            <a className="brand" href="#home"><span className="brand-mark">R</span><span>relavanet<span className="brand-light">uni</span></span></a>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">☰</button>
            <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                {['Study', 'Research', 'About'].map((item) => <a href={`#${item.toLowerCase()}`} key={item} onClick={() => setMenuOpen(false)}>{item}</a>)}
                <a className="nav-login" href="/faculty-login">Faculty portal <span>↗</span></a>
            </div>
        </nav>

        <main>
            <section className="hero container" id="home">
                <div className="hero-copy reveal"><div className="eyebrow"><span className="eyebrow-dot" /> RELAVANET UNIVERSITY · EST. 2008</div><h1>LEARN WITH<br /><em>PURPOSE.</em><br />LEAD WITH<br />IMPACT<span className="period">.</span></h1><p className="hero-description">A forward-looking university for people who want to turn knowledge into meaningful change. Find your place, then make it matter.</p><div className="hero-actions"><button className="primary-button" onClick={() => scrollTo('#study')}>Explore study <span>↗</span></button><a className="play-link" href="#about"><span className="play">▶</span> Discover Relavanet</a></div><div className="hero-proof"><strong>16:1</strong><small>student to faculty ratio</small><strong>94%</strong><small>graduate employment</small></div></div>
                <div className="hero-visual reveal"><div className="sun-orb" /><div className="scribble">make<br />it matter</div><div className="hero-image-wrap"><img src="https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=900&q=85" alt="University students walking across campus" /></div><div className="floating-card quote-card"><span>“</span><p>Education is the most powerful tool we can use to change the world.</p><small>— Nelson Mandela</small></div><div className="floating-card stat-card"><strong>40+</strong><small>programmes<br />to explore</small><span>↗</span></div></div>
            </section>
            <section className="features container reveal" id="study">{schools.map(([number, title, text]) => <article className="feature-card" key={title}><div className="feature-top"><span>{number}</span><b>↗</b></div><h3>{title}</h3><p>{text}</p><a href="#about">Explore school <span>↗</span></a></article>)}</section>
            <section className="content-grid container" id="about"><div className="mission reveal"><div className="section-label">/ OUR PROMISE</div><h2>THE UNIVERSITY<br />FOR <em>WHAT'S NEXT</em><span>.</span></h2><p>Relavanet brings ambitious people, practical learning, and big questions together. We give every student the confidence to think independently and the tools to contribute generously.</p><a className="text-link" href="#research">Meet our community <span>↗</span></a></div><aside className="side-panel reveal" id="research"><div className="panel-heading"><div><div className="section-label">/ RESEARCH</div><h3>Questions worth asking</h3></div><button aria-label="Explore research">↗</button></div><div className="subject-list">{researchAreas.map((area, index) => <a href="#about" className="subject" key={area}><span className="subject-icon">0{index + 1}</span><span><strong>{area}</strong><small>Research area</small></span><span className="arrow">↗</span></a>)}</div><div className="learners-card"><img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=700&q=80" alt="Researchers working in a university laboratory" /><div className="learners-overlay"><strong>120+</strong><span>ACTIVE<br />PROJECTS</span><span className="plus">+</span></div></div></aside></section>
        </main>
        <footer className="footer"><div className="container footer-inner"><a className="brand" href="#home"><span className="brand-mark">R</span><span>relavanet<span className="brand-light">uni</span></span></a><p>Knowledge with purpose. Progress with people.</p><div className="socials"><a href="#home">in</a><a href="#home">𝕏</a><a href="#home">◎</a></div><small>© 2026 Relavanet University. All rights reserved.</small></div></footer>
    </div>
}
export default App
