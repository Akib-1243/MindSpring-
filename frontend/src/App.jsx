import { useCallback, useEffect, useState } from 'react'
import './App.css'

const schools = [['01', 'Computing & Data', 'Build intelligent systems for a changing world.'], ['02', 'Business & Leadership', 'Turn insight into responsible, practical impact.'], ['03', 'Health & Life Sciences', 'Improve lives through evidence and curiosity.']]
const researchAreas = ['Artificial intelligence', 'Sustainable futures', 'Digital society', 'Human performance']

function FacultyLogin() {
    const [error, setError] = useState('')

    return <div className="faculty-page">
        <a className="back-link" href="/">← Back to MindSpring</a>
        <div className="faculty-login-wrap">
            <div className="faculty-intro"><div className="eyebrow"><span className="eyebrow-dot" /> MINDSPRING · FACULTY SERVICES</div><h1>Make every<br /><em>question</em> count.</h1><p>Access the Academic Quality Control Suite to compare syllabi, review assessment risk, and build stronger learning experiences.</p><div className="faculty-note"><strong>Faculty portal</strong><span>Secure workspace for teaching and assessment teams.</span></div></div>
            <form className="faculty-form" onSubmit={async (event) => { event.preventDefault(); setError(''); const form = new FormData(event.currentTarget); try { const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/faculty/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) }); if (!response.ok) throw new Error('Invalid faculty credentials.'); const data = await response.json(); localStorage.setItem('relavanet_token', data.token); window.location.href = '/faculty-dashboard' } catch (requestError) { setError(requestError.message) } }}><div className="section-label">/ SIGN IN</div><h2>Welcome back.</h2><p>Use your university credentials to continue.</p><label>University email<input name="email" type="email" placeholder="name@relavanet.edu" required /></label><label>Password<input name="password" type="password" placeholder="Enter your password" required /></label><div className="form-row"><label className="check-label"><input type="checkbox" /> Remember me</label><a href="mailto:it@relavanet.edu">Need help?</a></div><button className="primary-button" type="submit">Enter faculty portal <span>↗</span></button>{error && <div className="form-error">{error}</div>}</form>
        </div>
    </div>
}

function AdminDashboard() {
    const api = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    const [token, setToken] = useState(localStorage.getItem('relavanet_admin_token'))
    const [email, setEmail] = useState('admin@relavanet.edu')
    const [password, setPassword] = useState('')
    const [courses, setCourses] = useState([])
    const [faculty, setFaculty] = useState([])
    const [departments, setDepartments] = useState([])
    const [departmentAnalysis, setDepartmentAnalysis] = useState({})
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [editingCourse, setEditingCourse] = useState(null)
    const [editingQuestion, setEditingQuestion] = useState(null)
    const [selectedQuestion, setSelectedQuestion] = useState(null)

    const loadQuestionBank = async (adminToken) => {
        const response = await fetch(`${api}/admin/question-bank`, { headers: { Authorization: `Bearer ${adminToken}`, Accept: 'application/json' } })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Admin access is required.')
        setError('')
        setCourses(data.courses || [])
        setFaculty(data.faculty || [])
        setDepartments(data.departments || [])
        setDepartmentAnalysis(data.department_analysis || {})
    }

    const adminRequest = async (path, method, payload) => {
        const response = await fetch(`${api}${path}`, { method, headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' }, body: payload ? JSON.stringify(payload) : undefined })
        if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.message || 'Admin action failed.') }
        return response.status === 204 ? null : response.json()
    }

    const saveCourse = async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const payload = Object.fromEntries(form.entries()); try { await adminRequest(editingCourse?.id ? `/admin/courses/${editingCourse.id}` : '/admin/courses', editingCourse?.id ? 'PUT' : 'POST', payload); setEditingCourse(null); await loadQuestionBank(token) } catch (requestError) { setError(requestError.message) } }
    const saveQuestion = async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const payload = Object.fromEntries(form.entries()); try { await adminRequest(editingQuestion.id ? `/admin/courses/${editingQuestion.course_id}/questions/${editingQuestion.id}` : `/admin/courses/${editingQuestion.course_id}/questions`, editingQuestion.id ? 'PUT' : 'POST', payload); setEditingQuestion(null); await loadQuestionBank(token) } catch (requestError) { setError(requestError.message) } }
    const removeCourse = async (course) => { if (!window.confirm(`Delete ${course.code} and its question bank?`)) return; try { await adminRequest(`/admin/courses/${course.id}`, 'DELETE'); await loadQuestionBank(token) } catch (requestError) { setError(requestError.message) } }
    const removeQuestion = async (course, question) => { if (!window.confirm(`Delete ${question.question_code}?`)) return; try { await adminRequest(`/admin/courses/${course.id}/questions/${question.id}`, 'DELETE'); await loadQuestionBank(token) } catch (requestError) { setError(requestError.message) } }

    useEffect(() => { if (token) loadQuestionBank(token).catch((requestError) => setError(requestError.message)) }, [token])

    const login = async (event) => {
        event.preventDefault()
        setError('')
        setLoading(true)
        try {
            const response = await fetch(`${api}/faculty/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email, password }) })
            const data = await response.json()
            if (!response.ok || data.user?.role !== 'admin') throw new Error('Use an administrator account to continue.')
            localStorage.setItem('relavanet_admin_token', data.token)
            setToken(data.token)
        } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
    }

    if (!token) return <div className="faculty-page"><a className="back-link" href="/">← Back to MindSpring</a><div className="admin-login-wrap"><div><div className="eyebrow"><span className="eyebrow-dot" /> MINDSPRING · ADMIN</div><h1>Question bank<br /><em>control.</em></h1><p>Manage visibility across every course and keep assessment content aligned.</p></div><form className="faculty-form" onSubmit={login}><div className="section-label">/ ADMIN SIGN IN</div><h2>Welcome, admin.</h2><label>Administrator email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><button className="primary-button" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Open admin dashboard'} <span>↗</span></button>{error && <div className="form-error">{error}</div>}</form></div></div>

    return <div className="admin-page"><header className="dashboard-header"><a className="brand" href="/"><span className="brand-mark">R</span><span>relavanet<span className="brand-light">uni</span></span></a><div><span className="faculty-status">ADMIN CONTROL ROOM</span><button className="logout-link" onClick={() => { localStorage.removeItem('relavanet_admin_token'); setToken(null) }}>Sign out</button></div></header><main className="admin-main"><div className="ledger-title"><span className="ledger-kicker">Registrar's examination record</span><h1>Academic Ledger</h1><p>Question bank and course coverage register</p></div><div className="admin-toolbar"><div className="admin-summary"><strong>{courses.reduce((total, course) => total + course.question_bank.length, 0)}</strong><span>questions · {courses.length} courses</span></div><button className="admin-action primary" onClick={() => setEditingCourse({})}>+ Add course</button></div>{error && <div className="form-error admin-error">{error}</div>}{editingCourse && <CourseEditor course={editingCourse} faculty={faculty} departments={departments} onSave={saveCourse} onCancel={() => setEditingCourse(null)} />}{editingQuestion && <QuestionEditor question={editingQuestion} onSave={saveQuestion} onCancel={() => setEditingQuestion(null)} />}{!editingCourse && !editingQuestion && <div className={`ledger-layout ${selectedQuestion ? 'has-detail' : ''}`}><div className="admin-course-grid">{courses.map((course) => { const courseAnalysis = departmentAnalysis[course.id]; return <section className="admin-course" key={course.id}><div className="admin-course-heading"><div><span className="course-code">{course.code}</span><h2>{course.name}</h2><small>{course.user?.name || 'Unassigned owner'}</small></div><div className="admin-course-actions"><strong>{course.question_bank.length}</strong><button className="admin-action" onClick={() => setEditingQuestion({ course_id: course.id })}>+ Question</button><button className="admin-action" onClick={() => setEditingCourse(course)}>Edit</button><button className="admin-action danger" onClick={() => removeCourse(course)}>Delete</button></div></div>{courseAnalysis && <div className="department-analysis"><div><span className="ledger-kicker">Department analysis</span><strong>{courseAnalysis.department_name}</strong></div><p>{courseAnalysis.summary}</p>{courseAnalysis.shared_with?.length ? <div className="analysis-tags">{courseAnalysis.shared_with.slice(0, 3).map((match) => <span key={`${course.id}-${match.course}`}>{match.course}: {match.concepts.join(', ')}</span>)}</div> : <small>No strong keyword overlap detected yet.</small>}</div>}<div className="question-table"><div className="question-table-head"><span>Question record</span><span>Topic</span><span>Difficulty</span><span>Coverage</span><span>Actions</span></div>{course.question_bank.map((question) => <div className={`question-row ${selectedQuestion?.id === question.id ? 'selected' : ''}`} key={question.id} onClick={() => setSelectedQuestion({ question, course })}><div><strong>{question.question_code}</strong><p>{question.question_text}</p></div><span>{question.topic}</span><span className={`difficulty ${question.difficulty}`}>{question.difficulty}</span><span className="coverage-cell"><span className="coverage-bar"><i style={{ width: `${question.estimated_coverage_percent || 0}%` }} /></span><b>{question.estimated_coverage_percent || 0}%</b></span><div className="row-actions"><button className="admin-action" onClick={(event) => { event.stopPropagation(); setEditingQuestion({ ...question, course_id: course.id }) }}>Edit</button><button className="admin-action danger" onClick={(event) => { event.stopPropagation(); removeQuestion(course, question) }}>Delete</button></div></div>)}</div></section>})}</div>{selectedQuestion && <QuestionLedgerDetail question={selectedQuestion.question} course={selectedQuestion.course} onClose={() => setSelectedQuestion(null)} />}</div>}</main></div>
}

function FacultyDirectory() {
    const [open, setOpen] = useState(false)
    const [faculty, setFaculty] = useState([])
    const [courses, setCourses] = useState([])
    const [departments, setDepartments] = useState([])
    const [adding, setAdding] = useState(false)
    const [error, setError] = useState('')
    const [saved, setSaved] = useState('')
    const api = import.meta.env.VITE_API_URL || '/api'
    const token = localStorage.getItem('relavanet_admin_token')

    const loadFaculty = () => fetch(`${api}/admin/question-bank`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }).then((response) => response.json()).then((data) => { setFaculty(data.faculty || []); setCourses(data.courses || []); setDepartments(data.departments || []) })
    useEffect(() => { if (open) loadFaculty() }, [api, open, token])

    const addFaculty = async (event) => { event.preventDefault(); setError(''); setSaved(''); const payload = Object.fromEntries(new FormData(event.currentTarget).entries()); const response = await fetch(`${api}/admin/faculty`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const data = await response.json(); if (!response.ok) { setError(data.message || Object.values(data.errors || {}).flat()[0] || 'Unable to add faculty.'); return } event.currentTarget.reset(); setAdding(false); setSaved(`${data.name} was added to faculty.`); await loadFaculty() }

    return <div className="faculty-directory-widget"><button className={`admin-action faculty-directory-toggle ${open ? 'primary' : ''}`} onClick={() => setOpen((current) => !current)}>Faculty directory <span>{open ? '×' : '↗'}</span></button>{open && <section className="faculty-directory-panel"><div className="faculty-directory-heading"><div><span className="ledger-kicker">Academic staff register</span><h2>Faculty directory</h2></div><div className="faculty-directory-heading-actions"><span>{faculty.length} faculty members</span><button className="admin-action primary" onClick={() => { setAdding((current) => !current); setError('') }}>{adding ? 'Cancel' : '+ Add faculty'}</button></div></div>{adding && <form className="faculty-add-form" onSubmit={addFaculty}><label>Name<input name="name" placeholder="Dr. Maya Sen" required /></label><label>Email<input name="email" type="email" placeholder="maya@relavanet.edu" required /></label><label>Department<select name="department" defaultValue="" required><option value="">Select department</option>{departments.map((department) => <option value={department.name} key={department.id}>{department.name}</option>)}</select></label><label>Temporary password<input name="password" type="password" minLength="8" placeholder="Minimum 8 characters" required /></label><button className="primary-button" type="submit">Create faculty account <span>↗</span></button></form>}{error && <p className="analysis-error">{error}</p>}{saved && <p className="analysis-message">{saved}</p>}<div className="faculty-directory-grid">{faculty.map((person) => <article className="faculty-directory-card" key={person.id}><div className="faculty-avatar">{person.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div><strong>{person.name}</strong><span>{person.department || 'Academic faculty'}</span><a href={`mailto:${person.email}`}>{person.email}</a></div><small>{courses.filter((course) => course.user_id === person.id).length} courses assigned</small></article>)}</div></section>}</div>
}

function CourseEditor({ course, faculty, departments, onSave, onCancel }) { return <form className="admin-editor" onSubmit={onSave}><div className="editor-heading"><div><span className="section-label">/ COURSE {course.id ? 'EDIT' : 'CREATE'}</span><h2>{course.id ? `Edit ${course.code}` : 'Add a course'}</h2></div><button type="button" className="admin-action" onClick={onCancel}>Cancel</button></div><div className="editor-grid"><label>Course code<input name="code" defaultValue={course.code || ''} required /></label><label>Course name<input name="name" defaultValue={course.name || ''} required /></label><label>Department<select name="department_id" defaultValue={course.department_id || ''} required><option value="">Select department</option>{departments.map((department) => <option value={department.id} key={department.id}>{department.code} · {department.name}</option>)}</select></label><label>Faculty owner<select name="user_id" defaultValue={course.user_id || ''} required><option value="">Select faculty</option>{faculty.map((person) => <option value={person.id} key={person.id}>{person.name} · {person.email}</option>)}</select></label><label className="editor-wide">Syllabus<textarea name="syllabus_raw" defaultValue={course.syllabus_raw || ''} rows="4" required /></label></div><button className="primary-button" type="submit">Save course <span>↗</span></button></form> }

function QuestionEditor({ question, onSave, onCancel }) { return <form className="admin-editor" onSubmit={onSave}><div className="editor-heading"><div><span className="section-label">/ QUESTION BANK {question.id ? 'EDIT' : 'CREATE'}</span><h2>{question.id ? `Edit ${question.question_code}` : 'Add a question'}</h2></div><button type="button" className="admin-action" onClick={onCancel}>Cancel</button></div><div className="editor-grid"><label>Question code<input name="question_code" defaultValue={question.question_code || ''} required /></label><label>Topic<input name="topic" defaultValue={question.topic || ''} required /></label><label>Difficulty<select name="difficulty" defaultValue={question.difficulty || 'medium'}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label><label>Question type<input name="question_type" defaultValue={question.question_type || 'descriptive'} required /></label><label>Marks<input name="marks" type="number" min="1" max="100" defaultValue={question.marks || ''} /></label><label>Coverage %<input name="estimated_coverage_percent" type="number" min="0" max="100" defaultValue={question.estimated_coverage_percent || ''} /></label><label className="editor-wide">Question text<textarea name="question_text" defaultValue={question.question_text || ''} rows="4" required /></label></div><button className="primary-button" type="submit">Save question <span>↗</span></button></form> }

function QuestionLedgerDetail({ question, course, onClose }) {
    const levels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']
    const levelIndex = question.difficulty === 'easy' ? 0 : question.question_type === 'coding' || question.question_type === 'design' ? 5 : question.difficulty === 'hard' ? 4 : 2
    return <aside className="ledger-detail"><div className="detail-heading"><div><span className="ledger-kicker">Question record</span><h2>{question.question_code}</h2></div><button className="ledger-close" type="button" onClick={onClose} aria-label="Close question detail">×</button></div><p className="detail-course">{course.code} · {course.name}</p><p className="detail-question">{question.question_text}</p><div className="detail-rule" /><div className="bloom-block"><span className="ledger-kicker">Bloom's taxonomy</span><div className="bloom-ladder">{levels.map((level, index) => <div className={`bloom-rung ${index === levelIndex ? 'current' : ''}`} key={level}><span>{index + 1}</span><strong>{level}</strong>{index === levelIndex && <em>current level</em>}</div>)}</div></div><div className="outcome-line"><span className="ledger-kicker">Learning outcome</span><strong>{question.topic || 'General course outcome'}</strong><span>Tested once in this question record</span></div></aside>
}

function FacultyCourseLibrary() {
    const [open, setOpen] = useState(false)
    const [courses, setCourses] = useState([])
    const [selectedCourse, setSelectedCourse] = useState(null)
    const api = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    const token = localStorage.getItem('relavanet_token')

    useEffect(() => {
        if (!open) return
        fetch(`${api}/faculty/dashboard`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }).then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load course details.'))).then((data) => { const availableCourses = data.courses || []; setCourses(availableCourses); setSelectedCourse((current) => availableCourses.find((course) => course.id === current?.id) || availableCourses[0] || null) }).catch(() => setCourses([]))
    }, [api, open, token])

    return <div className={`faculty-course-library ${open ? 'is-open' : ''}`}><button className="faculty-course-library-toggle" type="button" onClick={() => setOpen((current) => !current)}>{open ? '× Close course details' : 'Course details'} <span>{open ? '' : '↗'}</span></button>{open && <section className="faculty-course-library-panel"><div className="faculty-course-library-heading"><div><span className="section-label">/ FACULTY REFERENCE</span><h2>Course details</h2></div><span>{courses.length} courses</span></div><label className="faculty-course-select">Select a course<select value={selectedCourse?.id || ''} onChange={(event) => setSelectedCourse(courses.find((course) => course.id === Number(event.target.value)) || null)}><option value="">Choose course</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.code} · {course.name}</option>)}</select></label>{selectedCourse && <div className="faculty-course-detail"><div className="faculty-course-detail-title"><span>{selectedCourse.department?.code || 'DEPT'}</span><strong>{selectedCourse.code}</strong><h3>{selectedCourse.name}</h3></div><p className="faculty-course-syllabus">{selectedCourse.syllabus_raw}</p><div className="faculty-reference-section"><small>PREVIOUS QUESTION BANK · {selectedCourse.question_bank?.length || 0}</small>{selectedCourse.question_bank?.length ? selectedCourse.question_bank.map((question) => <article className="faculty-question-record" key={question.id}><strong>{question.question_code}</strong><span>{question.topic} · {question.difficulty}</span><p>{question.question_text}</p></article>) : <p className="faculty-reference-empty">No previous questions recorded.</p>}</div><div className="faculty-reference-section"><small>PAST PAPERS · {selectedCourse.past_papers?.length || 0}</small>{selectedCourse.past_papers?.length ? selectedCourse.past_papers.map((paper) => <article className="faculty-past-paper" key={paper.id}><strong>{paper.year} · {paper.term}</strong><p>{paper.question_text}</p></article>) : <p className="faculty-reference-empty">No past papers recorded.</p>}</div></div>}</section>}</div>
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
    useEffect(() => { const closeResult = () => setResult(null); window.addEventListener('close-analysis-result', closeResult); return () => window.removeEventListener('close-analysis-result', closeResult) }, [])

    const analyze = async (event) => { event.preventDefault(); setError(''); setResult(null); const form = new FormData(event.currentTarget); const endpoint = tool === 'exam' ? '/faculty/exam/analyze' : '/faculty/syllabus/analyze'; const payload = tool === 'exam' ? { course_id: form.get('course_id'), new_question: form.get('new_question') } : { course_a_id: form.get('course_a_id'), course_b_id: form.get('course_b_id') }; const response = await fetch(`${api}${endpoint}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); const data = await response.json(); if (!response.ok) { setError(data.message || 'The analysis could not be completed.'); return } setResult({ type: tool, data }); await loadDashboard() }

    const courseName = (id) => courses.find((course) => course.id === id)?.code || 'Course'

    return <div className="dashboard-page"><header className="dashboard-header"><a className="brand" href="/"><span className="brand-mark">R</span><span>relavanet<span className="brand-light">uni</span></span></a><div><span className="faculty-status">FACULTY WORKSPACE</span><button className="logout-link" onClick={() => { localStorage.removeItem('relavanet_token'); window.location.href = '/faculty-login' }}>Sign out</button></div></header><main className="dashboard-main"><div className="dashboard-intro"><div className="section-label">/ ACADEMIC QUALITY CONTROL SUITE</div><h1>Good morning,<br /><em>faculty.</em></h1><p>Make assessment decisions with a clearer view of curriculum overlap, alignment, and risk.</p></div><div className="tool-switcher"><button className={tool === 'exam' ? 'active' : ''} onClick={() => { setTool('exam'); setResult(null) }}><span>01</span><strong>Exam forensics</strong><small>Check originality and syllabus alignment.</small></button><button className={tool === 'syllabus' ? 'active' : ''} onClick={() => { setTool('syllabus'); setResult(null) }}><span>02</span><strong>Syllabus duet</strong><small>Find overlap and strategic edges.</small></button></div><form className="analysis-form" onSubmit={analyze}><div className="section-label">/ {tool === 'exam' ? 'NEW FORENSIC ANALYSIS' : 'NEW SYLLABUS COMPARISON'}</div>{tool === 'exam' ? <><label>Course<select name="course_id" required><option value="">Select a course</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.code} · {course.name}</option>)}</select></label><label>New exam question<textarea name="new_question" rows="5" placeholder="Paste the question you want to audit..." required /></label></> : <div className="course-pair"><label>Source A<select name="course_a_id" required><option value="">Select a course</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.code} · {course.name}</option>)}</select></label><label>Source B<select name="course_b_id" required><option value="">Select a course</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.code} · {course.name}</option>)}</select></label></div>}<button className="primary-button" type="submit">Run analysis <span>↗</span></button>{error && <p className="analysis-error">{error}</p>}</form>{result && <AnalysisResult result={result} courseName={courseName} />}<section className="history-section"><div className="history-heading"><div><div className="section-label">/ SAVED REPORTS</div><h2>Recent analysis</h2></div><span>{history.exams.length + history.syllabi.length} reports</span></div><div className="history-grid">{history.exams.map((analysis) => <button className="history-card" key={`exam-${analysis.id}`} onClick={() => { setTool('exam'); setResult({ type: 'exam', data: analysis }) }}><span className="history-type">EXAM FORENSICS</span><strong>{analysis.overall_verdict}</strong><small>{courseName(analysis.course_id)} · {analysis.created_at?.slice(0, 10)}</small><div className="mini-scores"><span>Similarity <b>{analysis.similarity_score}%</b></span><span>Coverage <b>{analysis.syllabus_coverage_score}%</b></span></div></button>)}{history.syllabi.map((analysis) => <button className="history-card" key={`syllabus-${analysis.id}`} onClick={() => { setTool('syllabus'); setResult({ type: 'syllabus', data: analysis }) }}><span className="history-type">SYLLABUS DUET</span><strong>{analysis.overlaps?.length || 0} overlaps found</strong><small>{analysis.course_a?.code || 'Source A'} + {analysis.course_b?.code || 'Source B'} · {analysis.created_at?.slice(0, 10)}</small><div className="mini-scores"><span>Unique A <b>{analysis.unique_to_a?.length || 0}</b></span><span>Unique B <b>{analysis.unique_to_b?.length || 0}</b></span></div></button>)}{history.exams.length + history.syllabi.length === 0 && <p className="empty-history">No saved reports yet. Run an analysis to create the first one.</p>}</div></section></main></div>
}

function RoleGuard({ role, children }) {
    const [allowed, setAllowed] = useState(null)
    const api = import.meta.env.VITE_API_URL || '/api'
    const tokenKey = role === 'admin' ? 'relavanet_admin_token' : 'relavanet_token'

    useEffect(() => {
        const token = localStorage.getItem(tokenKey)
        if (!token) { window.location.href = role === 'admin' ? '/admin-dashboard' : '/faculty-login'; return }
        fetch(`${api}/faculty/me`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }).then(async (response) => {
            if (!response.ok) throw new Error('Unauthorized')
            return response.json()
        }).then((user) => {
            if (user.role !== role) { window.location.href = user.role === 'admin' ? '/admin-dashboard' : '/faculty-dashboard'; return }
            setAllowed(true)
        }).catch(() => { localStorage.removeItem(tokenKey); window.location.href = role === 'admin' ? '/admin-dashboard' : '/faculty-login' })
    }, [api, role, tokenKey])

    if (!allowed) return <div className="dashboard-page role-loading"><p>Checking workspace access...</p></div>
    return children
}

function AnalysisResult({ result, courseName, onClose = () => window.dispatchEvent(new Event('close-analysis-result')) }) {
    const analysis = result.data
    if (result.type === 'syllabus') return <section className="result-panel"><button className="result-close" type="button" onClick={onClose} aria-label="Close analysis result">×</button><div className="section-label">/ SYLLABUS DUET RESULT</div><h2>{analysis.overlaps?.length || 0} shared concepts found</h2><p>{analysis.strategic_advice}</p><div className="result-columns"><div><small>UNIQUE TO {analysis.course_a?.code || 'SOURCE A'}</small>{(analysis.unique_to_a || []).map((item) => <span className="result-tag" key={item}>{item}</span>)}</div><div><small>UNIQUE TO {analysis.course_b?.code || 'SOURCE B'}</small>{(analysis.unique_to_b || []).map((item) => <span className="result-tag" key={item}>{item}</span>)}</div></div></section>
    return <section className="result-panel"><button className="result-close" type="button" onClick={onClose} aria-label="Close analysis result">×</button><div className="section-label">/ FORENSIC RESULT · {courseName(analysis.course_id)}</div><div className="result-verdict"><div><h2>{analysis.overall_verdict}</h2><p>{analysis.new_question}</p></div><div className="result-score"><strong>{analysis.syllabus_coverage_score}%</strong><small>syllabus alignment</small></div></div><div className="result-metrics"><div><small>PREVIOUS PAPER SIMILARITY</small><strong>{analysis.similarity_score}%</strong></div><div><small>QUESTION BANK SIMILARITY</small><strong>{analysis.question_bank_similarity_score}%</strong></div><div><small>QUESTION BANK COVERAGE</small><strong>{analysis.question_bank_coverage_score}%</strong></div></div><p className="analysis-summary">{analysis.analysis_summary || 'The report has been generated from the submitted question, syllabus, previous papers, and question bank.'}</p><div className="result-columns"><div><small>QUESTION BANK MATCHES</small>{(analysis.question_bank_matches || []).length ? analysis.question_bank_matches.map((match) => <span className="result-tag" key={match.question_code}>{match.question_code} · {match.similarity_percent}%<br />{match.explanation}</span>) : <span className="clear-flag">No close question-bank matches detected.</span>}</div><div><small>CONTENT COVERED</small>{(analysis.covered_topics || []).map((topic) => <span className="clear-flag" key={topic.topic}>{topic.topic} · {topic.coverage_percent}%</span>)}{(analysis.uncovered_topics || []).map((topic) => <span className="risk-flag" key={topic.topic}>{topic.topic}: {topic.reason}</span>)}</div></div><div className="risk-list"><small>RISK FLAGS</small>{(analysis.risk_flags || []).length ? analysis.risk_flags.map((flag) => <span className="risk-flag" key={flag}>{flag}</span>) : <span className="clear-flag">No risk flags detected.</span>}</div></section>
}

function App() {
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')), { threshold: 0.14 })
        document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    if (window.location.pathname === '/faculty-login') return <FacultyLogin />
    if (window.location.pathname === '/admin-dashboard') return <RoleGuard role="admin"><><AdminDashboard /><FacultyDirectory /></></RoleGuard>
    if (window.location.pathname === '/faculty-dashboard') return <RoleGuard role="faculty"><><FacultyDashboard /><FacultyCourseLibrary /><FacultyChat /></></RoleGuard>

    const scrollTo = (id) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })

    return <div className="site-shell">
        <nav className="nav container">
            <a className="brand" href="#home"><span className="brand-mark">R</span><span>relavanet<span className="brand-light">uni</span></span></a>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">☰</button>
            <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                {['Study', 'Research', 'About'].map((item) => <a href={`#${item.toLowerCase()}`} key={item} onClick={() => setMenuOpen(false)}>{item}</a>)}
            </div>
        </nav>

        <main>
            <section className="hero container" id="home">
                 <div className="hero-copy reveal"><div className="eyebrow"><span className="eyebrow-dot" /> MINDSPRING · EST. 2008</div><h1>LEARN WITH<br /><em>PURPOSE.</em><br />LEAD WITH<br />IMPACT<span className="period">.</span></h1><p className="hero-description">A forward-looking university for people who want to turn knowledge into meaningful change. Find your place, then make it matter.</p><div className="hero-actions"><button className="primary-button" onClick={() => scrollTo('#study')}>Explore study <span>↗</span></button><a className="play-link" href="#about"><span className="play">▶</span> Discover MindSpring</a></div><div className="hero-proof"><strong>16:1</strong><small>student to faculty ratio</small><strong>94%</strong><small>graduate employment</small></div></div>
                <div className="hero-visual reveal"><div className="sun-orb" /><div className="scribble">make<br />it matter</div><div className="hero-image-wrap"><img src="https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=900&q=85" alt="University students walking across campus" /></div><div className="floating-card quote-card"><span>“</span><p>Education is the most powerful tool we can use to change the world.</p><small>— Nelson Mandela</small></div><div className="floating-card stat-card"><strong>40+</strong><small>programmes<br />to explore</small><span>↗</span></div></div>
            </section>
            <section className="features container reveal" id="study">{schools.map(([number, title, text]) => <article className="feature-card" key={title}><div className="feature-top"><span>{number}</span><b>↗</b></div><h3>{title}</h3><p>{text}</p><a href="#about">Explore school <span>↗</span></a></article>)}</section>
            <section className="content-grid container" id="about"><div className="mission reveal"><div className="section-label">/ OUR PROMISE</div><h2>THE UNIVERSITY<br />FOR <em>WHAT'S NEXT</em><span>.</span></h2><p>MindSpring brings ambitious people, practical learning, and big questions together. We give every student the confidence to think independently and the tools to contribute generously.</p><a className="text-link" href="#research">Meet our community <span>↗</span></a></div><aside className="side-panel reveal" id="research"><div className="panel-heading"><div><div className="section-label">/ RESEARCH</div><h3>Questions worth asking</h3></div><button aria-label="Explore research">↗</button></div><div className="subject-list">{researchAreas.map((area, index) => <a href="#about" className="subject" key={area}><span className="subject-icon">0{index + 1}</span><span><strong>{area}</strong><small>Research area</small></span><span className="arrow">↗</span></a>)}</div><div className="learners-card"><img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=700&q=80" alt="Researchers working in a university laboratory" /><div className="learners-overlay"><strong>120+</strong><span>ACTIVE<br />PROJECTS</span><span className="plus">+</span></div></div></aside></section>
        </main>
        <footer className="footer"><div className="container footer-inner"><a className="brand" href="#home"><span className="brand-mark">M</span><span>MindSpring</span></a><p>Knowledge with purpose. Progress with people.</p><div className="socials"><a href="#home">in</a><a href="#home">𝕏</a><a href="#home">◎</a></div><small>© 2026 MindSpring. All rights reserved.</small></div></footer>
    </div>
}
export default App
