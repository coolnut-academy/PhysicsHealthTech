/**
 * PhysicsHealthTech V2.0 - Project & Portfolio Service
 * Rules:
 * - Individual projects: 0..N allowed per student (no max 1 cap)
 * - Group projects: exactly 1 per group per round (duplicate denied)
 * - Artifacts are append-only versions
 * - Validate HTTPS GitHub Pages link (no javascript:, no unsafe URLs)
 * - Active group membership enforced for read/write
 */

const ProjectService = {
  /**
   * Validate project web URL
   */
  validateWebUrl(url) {
    if (!url) return null;
    const str = String(url).trim();
    if (!str.startsWith("https://")) {
      throw new Error("INVALID_URL: ลิงก์โครงงานต้องเป็น HTTPS เท่านั้น (เช่น https://username.github.io/project)");
    }
    if (/javascript:/i.test(str) || /data:/i.test(str)) {
      throw new Error("INVALID_URL: รูปแบบลิงก์ไม่ปลอดภัย");
    }
    return str;
  },

  /**
   * List projects visible to student (own individual + active groups)
   */
  listMine(session, payload, repository) {
    const studentUid = Authorization.enforceStudent(session);
    const { academic_year_id } = payload || {};

    const individualProjects = repository.findProjectsByOwner(studentUid, academic_year_id);
    const studentGroups = repository.findGroupsForStudent(studentUid, academic_year_id);
    const groupProjects = [];

    studentGroups.forEach(grp => {
      const gProject = repository.findProjectByGroup(grp.group_id);
      if (gProject) {
        groupProjects.push({
          ...gProject,
          group_title: grp.title,
          group_members: grp.members
        });
      }
    });

    return {
      ok: true,
      data: {
        individual_projects: individualProjects,
        group_projects: groupProjects
      }
    };
  },

  /**
   * Create Individual Project (0..N permitted)
   */
  createIndividual(session, payload, repository) {
    const studentUid = Authorization.enforceStudent(session);
    const { academic_year_id, grade, title, github_pages_url } = payload || {};

    if (!academic_year_id || !grade || !title) {
      throw new Error("INVALID_REQUEST: โปรดระบุปีการศึกษา ระดับชั้น และชื่อโครงงานเดี่ยว");
    }

    const safeUrl = this.validateWebUrl(github_pages_url);
    const projectId = `prj_ind_${AuthService.generateSecureToken().substring(0, 16)}`;
    const now = new Date().toISOString();

    const project = {
      project_id: projectId,
      academic_year_id,
      grade,
      type: "individual",
      owner_student_uid: studentUid,
      group_id: null,
      round_id: null,
      title: title.trim(),
      github_pages_url: safeUrl,
      state: "active",
      revision: 1,
      created_at: now,
      deleted_at: null
    };

    repository.saveProject(project);

    return {
      ok: true,
      data: {
        project_id: projectId,
        title: project.title,
        message_th: "สร้างโครงงานเดี่ยวเรียบร้อยแล้ว"
      }
    };
  },

  /**
   * Create Group Project (exactly 1 per group per round)
   */
  createGroupProject(session, payload, repository) {
    const studentUid = Authorization.enforceStudent(session);
    const { group_id, round_id, title, github_pages_url } = payload || {};

    if (!group_id || !round_id || !title) {
      throw new Error("INVALID_REQUEST: โปรดระบุ group_id, round_id และชื่อโครงงานกลุ่ม");
    }

    // Verify active group membership
    Authorization.enforceGroupMembership(session, group_id, repository);

    // Enforce 1 project per group per round (DATA10)
    const existing = repository.findProjectByGroupAndRound(group_id, round_id);
    if (existing && !existing.deleted_at) {
      throw new Error("DUPLICATE_GROUP_PROJECT: กลุ่มนี้มีโครงงานในรอบนี้แล้ว (จำกัด 1 ชิ้นต่อกลุ่มต่อรอบ)");
    }

    const group = repository.findGroupById(group_id);
    const safeUrl = this.validateWebUrl(github_pages_url);
    const projectId = `prj_grp_${AuthService.generateSecureToken().substring(0, 16)}`;
    const now = new Date().toISOString();

    const project = {
      project_id: projectId,
      academic_year_id: group.academic_year_id,
      grade: group.grade,
      type: "group",
      owner_student_uid: null,
      group_id: group_id,
      round_id: round_id,
      title: title.trim(),
      github_pages_url: safeUrl,
      state: "active",
      revision: 1,
      created_at: now,
      deleted_at: null
    };

    repository.saveProject(project);

    return {
      ok: true,
      data: {
        project_id: projectId,
        title: project.title,
        message_th: "สร้างโครงงานกลุ่มเรียบร้อยแล้ว"
      }
    };
  },

  /**
   * Add artifact to project (prompt, test_case, ui_photo, result, link)
   */
  addArtifact(session, payload, repository) {
    const { project_id, artifact_kind, text_content, file_ref } = payload || {};

    if (!project_id || !artifact_kind) {
      throw new Error("INVALID_REQUEST: ข้อมูลชิ้นงานโครงงานไม่ครบถ้วน");
    }

    const project = repository.findProjectById(project_id);
    if (!project || project.deleted_at) {
      throw new Error("PROJECT_NOT_FOUND: ไม่พบโครงงานในระบบ");
    }

    // Authorization check
    if (project.type === "individual") {
      Authorization.enforceResourceAccess(session, project.owner_student_uid);
    } else {
      Authorization.enforceGroupMembership(session, project.group_id, repository);
    }

    const authorUid = session.principal_uid;
    const existingArtifacts = repository.findArtifactsByProjectAndKind(project_id, artifact_kind);
    const newVersionNo = existingArtifacts.length + 1;
    const artifactId = `art_${AuthService.generateSecureToken().substring(0, 16)}`;
    const now = new Date().toISOString();

    const artifact = {
      artifact_id: artifactId,
      project_id,
      artifact_kind,
      version_no: newVersionNo,
      author_uid: authorUid,
      text_content: text_content || "",
      submission_file_ref: file_ref || null,
      created_at: now,
      deleted_at: null
    };

    repository.saveProjectArtifact(artifact);

    return {
      ok: true,
      data: {
        artifact_id: artifactId,
        version_no: newVersionNo,
        artifact_kind,
        created_at: now,
        message_th: "บันทึกชิ้นงานเวอร์ชันใหม่เรียบร้อยแล้ว"
      }
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = ProjectService;
}

