/**
 * PhysicsHealthTech V2.0 - Authorization & Security Policy Enforcement
 * Threat Model: SECURITY_MODEL.md, AC01, AC09, GR10, GR11, SEC02, SEC04, SEC05
 * 
 * Rules:
 * - Server-only role and principal checks.
 * - Never trust client-supplied role, student_uid, teacher_flag, or group_id.
 * - Negative authorization defaults to ACCESS_DENIED.
 * - Anti-IDOR: Students can only access their own submissions, files, and grades.
 * - Group members can only access their group's shared artifacts while active.
 */

const Authorization = {
  /**
   * Enforce that the caller is an authenticated student
   */
  enforceStudent(session) {
    if (!session || session.principal_type !== "student" || !session.principal_uid) {
      const err = new Error("ACCESS_DENIED: ต้องเข้าสู่ระบบด้วยบัญชีนักเรียน");
      err.code = "ACCESS_DENIED";
      throw err;
    }
    return session.principal_uid;
  },

  /**
   * Enforce that the caller is a verified teacher or admin
   */
  enforceTeacher(session, requiredRole = "teacher") {
    if (!session || session.principal_type !== "teacher") {
      const err = new Error("ACCESS_DENIED: คุณไม่มีสิทธิ์เข้าถึงส่วนงานสำหรับครูผู้สอน");
      err.code = "ACCESS_DENIED";
      throw err;
    }
    if (requiredRole === "admin" && session.role !== "admin") {
      const err = new Error("ACCESS_DENIED: ต้องใช้สิทธิ์ผู้ดูแลระบบ (Admin) เท่านั้น");
      err.code = "ACCESS_DENIED";
      throw err;
    }
    return session.principal_uid;
  },

  /**
   * Enforce that student owns the target resource (Anti-IDOR)
   * If caller is teacher, access is allowed.
   * If caller is student, targetOwnerUid MUST strictly match session.principal_uid.
   */
  enforceResourceAccess(session, targetOwnerUid) {
    if (!session) {
      const err = new Error("ACCESS_DENIED: ไม่พบเซสชันการใช้งาน");
      err.code = "ACCESS_DENIED";
      throw err;
    }

    if (session.principal_type === "teacher") {
      return true; // Teachers can access student evidence for grading
    }

    if (session.principal_type === "student") {
      if (session.principal_uid !== targetOwnerUid) {
        const err = new Error("ACCESS_DENIED: คุณไม่ได้รับอนุญาตให้ดูหรือแก้ไขข้อมูลของผู้อื่น");
        err.code = "ACCESS_DENIED";
        throw err;
      }
      return true;
    }

    const err = new Error("ACCESS_DENIED: การเข้าถึงถูกปฏิเสธ");
    err.code = "ACCESS_DENIED";
    throw err;
  },

  /**
   * Enforce active group membership
   * If caller is teacher, access is allowed.
   * If caller is student, student MUST be in active group members.
   */
  enforceGroupMembership(session, groupId, repository) {
    if (!session) {
      const err = new Error("ACCESS_DENIED: ไม่พบเซสชันการใช้งาน");
      err.code = "ACCESS_DENIED";
      throw err;
    }

    if (session.principal_type === "teacher") {
      return true;
    }

    if (session.principal_type === "student") {
      const isMember = repository.isStudentActiveInGroup(session.principal_uid, groupId);
      if (!isMember) {
        const err = new Error("ACCESS_DENIED: คุณไม่ได้เป็นสมาชิกที่ได้รับอนุญาตในกลุ่มนี้");
        err.code = "ACCESS_DENIED";
        throw err;
      }
      return true;
    }

    const err = new Error("ACCESS_DENIED: การเข้าถึงถูกปฏิเสธ");
    err.code = "ACCESS_DENIED";
    throw err;
  },

  /**
   * Determine whether a submission is within the official roster or out-of-roster
   */
  checkOutOfRoster(studentUid, academicYearId, grade, repository) {
    const enrollment = repository.findActiveEnrollment(studentUid, academicYearId, grade);
    return {
      is_out_of_roster: !enrollment,
      enrollment: enrollment || null
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = Authorization;
}

