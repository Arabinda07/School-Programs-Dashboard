export function computeDashboardKPIs(data: {
  programs: any[];
  activities: any[];
  documentation: any[];
  actions: any[];
  feedback: any[];
  classes: any[];
  currentDate: Date;
}) {
  const { programs: p, activities: a, documentation: d, actions: ac, feedback: f, classes: c, currentDate } = data;

  // KPI: Active programs
  const activeProgramsCount = p.filter((prog: any) => !['Completed', 'Cancelled'].includes(prog.status)).length;
  
  // KPI: Activity completion
  const activityCompletion = a.length > 0 ? (a.filter((act: any) => act.status === 'Completed').length / a.length) * 100 : 0;
  
  // KPI: Class coverage & Students reached
  const completedClasses = [...new Set(a.filter((act: any) => act.status === 'Completed').map((act: any) => act.class_id))];
  const classReachCount = completedClasses.length;
  const totalClasses = c.length;
  const studentReach = completedClasses.reduce((sum, clsId) => {
    const cls = c.find((cl: any) => cl.id === clsId);
    return sum + (cls ? cls.student_strength : 0);
  }, 0);
  const totalStudents = c.reduce((sum: number, cls: any) => sum + cls.student_strength, 0);

  // KPI: Documentation completion
  const docCompletion = d.length > 0 ? (d.filter((doc: any) => doc.status === 'Approved').length / d.length) * 100 : 0;

  // KPI: Actions
  const openActions = ac.filter((act: any) => ['Open', 'In Progress'].includes(act.status));
  const openActionsCount = openActions.length;
  const overdueActions = openActions.filter((act: any) => new Date(act.due_date) < currentDate);
  const overdueActionsCount = overdueActions.length;

  // KPI: Feedback
  const avgFeedback = f.length > 0 ? f.reduce((sum: number, fb: any) => sum + fb.sentiment_score, 0) / f.length : 0;

  // Program Health
  const programHealth = p.map((prog: any) => {
    const pActs = a.filter((act: any) => act.program_id === prog.id);
    const actComp = pActs.length ? (pActs.filter((act: any) => act.status === 'Completed').length / pActs.length) * 100 : 0;
    
    const pDocs = d.filter((doc: any) => doc.program_id === prog.id);
    const docComp = pDocs.length ? (pDocs.filter((doc: any) => doc.status === 'Approved').length / pDocs.length) * 100 : 0;
    
    const pActions = ac.filter((act: any) => act.program_id === prog.id && ['Open', 'In Progress'].includes(act.status));
    const pDocsMissing = pDocs.some((doc: any) => doc.status === 'Missing');
    
    let indicator = 'Good';
    if (prog.status === 'Delayed' || prog.status === 'At Risk' || pActions.some((actItem: any) => actItem.severity === 'Critical')) {
       indicator = 'At Risk';
    } else if (actComp < 50 || pDocsMissing || pActions.length > 2) {
       indicator = 'Watch';
    }

    return {
      ...prog,
      actComp,
      docComp,
      openActions: pActions.length,
      indicator
    };
  });

  // Timeline
  const timeline = {
    upcoming: a.filter((act: any) => act.status === 'Planned' && act.target_date && new Date(act.target_date) >= currentDate).sort((act1: any, act2: any) => new Date(act1.target_date).getTime() - new Date(act2.target_date).getTime()).slice(0, 5),
    delayed: a.filter((act: any) => act.status === 'Delayed').sort((act1: any, act2: any) => new Date(act1.target_date).getTime() - new Date(act2.target_date).getTime()).slice(0, 5),
    recent: a.filter((act: any) => act.status === 'Completed' && act.actual_date).sort((act1: any, act2: any) => new Date(act2.actual_date).getTime() - new Date(act1.actual_date).getTime()).slice(0, 5)
  };

  // Doc Alerts
  const docAlerts = d.filter((doc: any) => ['Missing', 'Pending', 'Rejected'].includes(doc.status)).sort((doc1: any, doc2: any) => new Date(doc1.due_date).getTime() - new Date(doc2.due_date).getTime()).slice(0, 6);

  // Top actions
  const topActions = openActions.sort((aItem: any, bItem: any) => {
    if (aItem.severity === 'Critical' && bItem.severity !== 'Critical') return -1;
    if (bItem.severity === 'Critical' && aItem.severity !== 'Critical') return 1;
    return new Date(aItem.due_date).getTime() - new Date(bItem.due_date).getTime();
  }).slice(0, 5);

  return {
    activeProgramsCount, activityCompletion, studentReach, totalStudents,
    classReachCount, totalClasses, docCompletion, openActionsCount,
    overdueActionsCount, avgFeedback, programHealth, timeline, docAlerts, topActions
  };
}
