import React, { useState, useEffect } from 'react';
import { api, exportAllClassesCsv } from '@/lib/api';

const BulkAssignStudents = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [errorsList, setErrorsList] = useState<any[] | null>(null);
  const [headerValid, setHeaderValid] = useState<boolean | null>(null);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setResult('');
    setErrorsList(null);
    setHeaderValid(null);
    setHeaderError(null);
    if (f) {
      // read first line to validate headers
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = String(ev.target?.result || '');
        const firstLine = text.split(/\r?\n/)[0] || '';
        const headers = firstLine.split(',').map(h => h.trim().toLowerCase());
        const ok = validateCsvHeaders(headers, !!selectedClassId);
        setHeaderValid(ok.valid);
        setHeaderError(ok.error || null);
      };
      reader.readAsText(f);
    }
  };

  function validateCsvHeaders(headers: string[], allowMissingClass = false) {
    const hasEmail = headers.includes('email') || headers.includes('e_mail') || headers.includes('e-mail');
    const hasClass = headers.includes('classid') || headers.includes('class_id') || headers.includes('class id') || headers.includes('class');
    if (!hasEmail && !hasClass) return { valid: false, error: 'Missing headers: email, classId' };
    if (!hasEmail) return { valid: false, error: 'Missing header: email' };
    if (!hasClass && !allowMissingClass) return { valid: false, error: 'Missing header: classId (classId or class_id)' };
    return { valid: true };
  }

  // Academic years & semesters for default selection
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string | undefined>(undefined);
  const [semestersForYear, setSemestersForYear] = useState<any[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | undefined>(undefined);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [yearsRes, classesRes] = await Promise.all([api.get('/academic-years'), api.get('/classes')]);
        const years = yearsRes.data || [];
        const classes = classesRes.data.classes || classesRes.data || [];
        if (!mounted) return;
        setAcademicYears(years);
        setClassesList(classes);
        // pick first class by default
        if (classes.length) setSelectedClassId(classes[0].id);
        // pick current year if provided, else first
        const current = years.find((y: any) => y.isCurrent) || years[0];
        if (current) {
          setSelectedYearId(current.id);
          setSemestersForYear(Array.isArray(current.semesters) ? current.semesters : []);
          if (Array.isArray(current.semesters) && current.semesters.length) setSelectedSemesterId(current.semesters[0].id);
        }
      } catch (e) {
        console.error('Failed to load academic years or classes', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const y = academicYears.find((y) => y.id === selectedYearId);
    if (y) {
      const sems = Array.isArray(y.semesters) ? y.semesters : [];
      setSemestersForYear(sems);
      if (sems.length && !sems.find(s => s.id === selectedSemesterId)) setSelectedSemesterId(sems[0].id);
    } else {
      setSemestersForYear([]);
      setSelectedSemesterId(undefined);
    }
    // if a file is already selected, re-validate headers because defaultClassId may affect validation
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = String(ev.target?.result || '');
        const firstLine = text.split(/\r?\n/)[0] || '';
        const headers = firstLine.split(',').map(h => h.trim().toLowerCase());
        const ok = validateCsvHeaders(headers, !!selectedClassId);
        setHeaderValid(ok.valid);
        setHeaderError(ok.error || null);
      };
      reader.readAsText(file);
    }
  }, [selectedYearId, academicYears]);

  const handleUpload = async () => {
    if (!file) return;
    if (headerValid === false) {
      setResult(`Invalid CSV headers: ${headerError}`);
      return;
    }
    setLoading(true);
    setResult('');
    const formData = new FormData();
    formData.append('file', file);
    // send selected defaults so server can apply them when CSV rows omit year/semester
    if (selectedYearId) formData.append('defaultAcademicYearId', selectedYearId);
    if (selectedSemesterId) formData.append('defaultSemesterId', selectedSemesterId);
  if (selectedClassId) formData.append('defaultClassId', selectedClassId);
    try {
      // use shared api instance so JWT is attached automatically
      const res = await api.post('/users/assign-students-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(`Students assigned: ${res.data.assigned}\nErrors: ${res.data.errors?.length || 0}`);
      setErrorsList(res.data.errors && res.data.errors.length ? res.data.errors : null);
    } catch (err: any) {
      console.error('Bulk upload error', err);
  const message = err?.response?.data?.error || err?.message || 'Upload failed';
  setResult(`Upload failed: ${message}`);
  // If server returned structured errors, show them
  const serverErrors = err?.response?.data?.errors || err?.response?.data?.errors || err?.response?.data;
  if (serverErrors && Array.isArray(serverErrors)) setErrorsList(serverErrors);
    }
    setLoading(false);
  };

  const handleDownloadClassIds = async () => {
    try {
      // Fetch classes and academic years (academic years include semesters)
      const [classesRes, yearsRes] = await Promise.all([api.get('/classes'), api.get('/academic-years')]);
      const classes = classesRes.data.classes || classesRes.data || [];
      const years = yearsRes.data || [];

      // CSV header: include semesterId
      let csv = 'classId,classLabel,grade,section,academicYearId,academicYearName,semesterId,semesterName\n';
      for (const cls of classes) {
        const gradeName = cls.grade?.name || '';
        const sectionName = cls.classSection?.name || '';
        // Build a readable class label, e.g. "Grade 10 B" or "G10 A" depending on your naming
        const classLabel = `${gradeName}${gradeName && sectionName ? ' ' : ''}${sectionName}`.trim();
        for (const year of years) {
          const semesters = Array.isArray(year.semesters) && year.semesters.length ? year.semesters : [null];
          for (const sem of semesters) {
            const semId = sem ? sem.id : '';
            const semName = sem ? (sem.name || sem.label || '') : '';
            csv += `${cls.id},${classLabel},${gradeName},${sectionName},${year.id},${year.name || year.year || ''},${semId},${semName}\n`;
          }
        }
      }

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all_classes_academic_years_semesters.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download class ids CSV', err);
      setResult('Failed to download class ids');
    }
  };


  const sampleCsv = `email,classId,academicYearId,semesterId
student1@email.com,CLASS_ID_1,ACADEMIC_YEAR_ID_1,SEMESTER_ID_1
student2@email.com,CLASS_ID_1,ACADEMIC_YEAR_ID_1,SEMESTER_ID_2`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_student_assignment_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>Bulk Assign Students to Class</h2>
      <div style={{ marginBottom: 8 }}>
        <label style={{ marginRight: 8 }}>Default Academic Year:</label>
        <select value={selectedYearId || ''} onChange={(e) => setSelectedYearId(e.target.value || undefined)}>
          <option value="">(use current)</option>
          {academicYears.map((y) => (
            <option key={y.id} value={y.id}>{y.name || y.year || y.id}</option>
          ))}
        </select>
        <label style={{ marginLeft: 12, marginRight: 8 }}>Default Semester:</label>
        <select value={selectedSemesterId || ''} onChange={(e) => setSelectedSemesterId(e.target.value || undefined)}>
          <option value="">(none)</option>
          {semestersForYear.map((s) => (
            <option key={s.id} value={s.id}>{s.name || s.label || s.id}</option>
          ))}
        </select>
        <label style={{ marginLeft: 12, marginRight: 8 }}>Default Class:</label>
        <select value={selectedClassId || ''} onChange={(e) => setSelectedClassId(e.target.value || undefined)}>
          <option value="">(none)</option>
          {classesList.map((c) => (
            <option key={c.id} value={c.id}>{`${c.grade?.name || ''}${c.grade?.name && c.classSection?.name ? ' ' : ''}${c.classSection?.name || ''}`.trim() || c.id}</option>
          ))}
        </select>
      </div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Uploading...' : 'Upload CSV'}
      </button>
      {result && <div style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>{result}</div>}
      {errorsList && (
        <div style={{ marginTop: 10 }}>
          <strong>Details:</strong>
          <pre style={{ maxHeight: 300, overflow: 'auto', background: '#f7f7f7', padding: 8 }}>{JSON.stringify(errorsList, null, 2)}</pre>
        </div>
      )}
      <div style={{ marginTop: 10 }}>
  <strong>CSV Template:</strong>
  <pre>email,classId</pre>
        <button onClick={handleDownloadSample} style={{ marginTop: 8 }}>
          Download Sample CSV
        </button>
        <button onClick={handleDownloadClassIds} style={{ marginTop: 8, marginLeft: 8 }}>
          Download All Class IDs CSV
        </button>
      </div>
    </div>
  );
};

export default BulkAssignStudents;
