/**
 * PhysicsHealthTech V2.0 - Session Service
 * Manages 20 sessions course plan snapshots per academic year and grade.
 * 
 * Rules:
 * - Each course consists of 20 sessions (100 min/session)
 * - Saved as a snapshot isolated per academic year and grade
 * - Changes in one academic year do not affect other academic years
 */

const SessionService = {
  DEFAULT_M4_SESSIONS: [
    {
      session_no: 1,
      title: "ปฐมนิเทศและการวัดปริมาณทางกายภาพสุขภาพ",
      description: "แนะนำรายวิชา ข้อตกลง เกณฑ์การประเมิน เครื่องมือวัดพื้นฐานและเลขนัยสำคัญทางชีวกลศาสตร์",
      linked_worksheet_code: "PHT4-W01",
      category: "lecture"
    },
    {
      session_no: 2,
      title: "ปฏิบัติการวัดสัญญาณชีพและความคลาดเคลื่อน (Lab W01)",
      description: "ฝึกปฏิบัติวัดความดันโลหิต อัตราชีพจร และวิเคราะห์ความคลาดเคลื่อนทางสถิติ บันทึกผลส่งใบงานที่ 1",
      linked_worksheet_code: "PHT4-W01",
      category: "lab"
    },
    {
      session_no: 3,
      title: "จลนศาสตร์การเคลื่อนที่และเวกเตอร์ของร่างกายมนุษย์",
      description: "ศึกษาตำแหน่ง การกระจัด ความเร็ว ความเร่ง ในการเคลื่อนไหวของข้อต่อและรยางค์",
      linked_worksheet_code: "PHT4-W02",
      category: "lecture"
    },
    {
      session_no: 4,
      title: "การวิเคราะห์การเคลื่อนไหวทางชีวกลศาสตร์ด้วยวิดีโอ (Lab W02)",
      description: "บันทึกและวิเคราะห์เวกเตอร์การเคลื่อนไหวข้อเท้าด้วยซอฟต์แวร์ Tracker บันทึกผลส่งใบงานที่ 2",
      linked_worksheet_code: "PHT4-W02",
      category: "lab"
    },
    {
      session_no: 5,
      title: "กฎการเคลื่อนที่ของนิวตันและแรงกระทำในระบบกล้ามเนื้อ",
      description: "ศึกษาแรงภายในกล้ามเนื้อ แรงภายนอก และสมดุลแรงต่อกระดูกสันหลังและข้อต่อ",
      linked_worksheet_code: "PHT4-W03",
      category: "lecture"
    },
    {
      session_no: 6,
      title: "การทดลองจุดศูนย์ถ่วงและเสถียรภาพการทรงตัว (Lab W03)",
      description: "หาจุดศูนย์ถ่วง (Center of Gravity) ของร่างกายในอิริยาบถต่างๆ และการประยุกต์ป้องกันการล้ม ส่งใบงานที่ 3",
      linked_worksheet_code: "PHT4-W03",
      category: "lab"
    },
    {
      session_no: 7,
      title: "งานและพลังงานในระบบชีวกลของมนุษย์",
      description: "นิยามงานทางกลศาสตร์ พลังงานจลน์ พลังงานศักย์ และอัตราการเผาผลาญพลังงานพื้นฐาน (BMR)",
      linked_worksheet_code: "PHT4-W04",
      category: "lecture"
    },
    {
      session_no: 8,
      title: "การทดสอบกำลังงานและการก้าวเดิน (Lab W04)",
      description: "ปฏิบัติการคำนวณกำลังงานที่ใช้ในการเดิน-วิ่ง และประสิทธิภาพเชิงกลของร่างกาย ส่งใบงานที่ 4",
      linked_worksheet_code: "PHT4-W04",
      category: "lab"
    },
    {
      session_no: 9,
      title: "โมเมนตัม แรงดล และกลไกการบาดเจ็บจากการชน",
      description: "กฎการอนุรักษ์โมเมนตัม แรงดล และชีวกลศาสตร์การบาดเจ็บทางกีฬาและอุบัติเหตุ",
      linked_worksheet_code: "PHT4-W05",
      category: "lecture"
    },
    {
      session_no: 10,
      title: "การทดสอบแรงดลและการซับแรงกระแทก (Lab W05)",
      description: "ทดสอบคุณสมบัติการดูดซับแรงกระแทกของวัสดุทางการแพทย์และกีฬา ส่งใบงานที่ 5",
      linked_worksheet_code: "PHT4-W05",
      category: "lab"
    },
    {
      session_no: 11,
      title: "สมดุลการหมุน ทอร์ก และระบบคานในร่างกาย",
      description: "การคำนวณทอร์ก แขนของแรง และระบบคาน 3 ประเภทในข้อต่อและกระดูกมนุษย์",
      linked_worksheet_code: "PHT4-W06",
      category: "lecture"
    },
    {
      session_no: 12,
      title: "การวัดทอร์กข้อต่อและแขนกลชีวภาพ (Lab W06)",
      description: "การทดลองวัดทอร์กของกล้ามเนื้อไบเซปส์และแบบจำลองข้อศอก ส่งใบงานที่ 6",
      linked_worksheet_code: "PHT4-W06",
      category: "lab"
    },
    {
      session_no: 13,
      title: "สภาพยืดหยุ่น ความเค้น ความเครียดของเนื้อเยื่อชีวภาพ",
      description: "กฎของฮุก โมดูลัสของยัง และพฤติกรรมเชิงกลของกระดูก เส้นเอ็น และหลอดเลือด",
      linked_worksheet_code: "PHT4-W07",
      category: "lecture"
    },
    {
      session_no: 14,
      title: "การทดสอบมอดุลัสความยืดหยุ่นของวัสดุกายภาพ (Lab W07)",
      description: "ปฏิบัติการทดสอบแรงดึงและความเค้นของวัสดุอุปกรณ์กายภาพบำบัด ส่งใบงานที่ 7",
      linked_worksheet_code: "PHT4-W07",
      category: "lab"
    },
    {
      session_no: 15,
      title: "สถิตยศาสตร์ของไหลและความดันในระบบหลอดเลือด",
      description: "ความหนาแน่น ความดันสถิต กฎของปาสคาล และหลักการของเครื่องวัดความดันแบบคอลัมน์ปรอท",
      linked_worksheet_code: "PHT4-W08",
      category: "lecture"
    },
    {
      session_no: 16,
      title: "พลศาสตร์ของไหลและสมการแบร์นูลลีในระบบไหลเวียนเลือด",
      description: "สมการความต่อเนื่อง สมการแบร์นูลลี ความหนืด และผลกระทบต่อภาวะหลอดเลือดตีบตัน",
      linked_worksheet_code: "PHT4-W08",
      category: "lecture"
    },
    {
      session_no: 17,
      title: "แบบจำลองระบบหลอดเลือดและการไหล (Lab W08)",
      description: "ปฏิบัติการทดสอบแบบจำลองการไหลของของเหลวในท่อยางจำลองเส้นเลือด ส่งใบงานที่ 8",
      linked_worksheet_code: "PHT4-W08",
      category: "lab"
    },
    {
      session_no: 18,
      title: "บูรณาการโครงงานฟิสิกส์สุขภาพ: ระดมความคิดและกำหนดโจทย์วิจัย",
      description: "แบ่งกลุ่มโครงงาน สำรวจปัญหาด้านสุขภาพในโรงเรียน/ชุมชน และออกแบบกรอบโครงงาน",
      linked_worksheet_code: "PHT4-W09",
      category: "project"
    },
    {
      session_no: 19,
      title: "ปฏิบัติการประดิษฐ์ต้นแบบและเก็บข้อมูลโครงงาน (Lab W09)",
      description: "สร้างชิ้นงานต้นแบบ หรือ ดำเนินการทดลองเก็บข้อมูลเชิงวิทยาศาสตร์สุขภาพ บันทึกส่งใบงานที่ 9",
      linked_worksheet_code: "PHT4-W09",
      category: "project"
    },
    {
      session_no: 20,
      title: "การนำเสนอผลงานโครงงานกลุ่มและประเมินผลสัมฤทธิ์",
      description: "นำเสนอโปสเตอร์/ชิ้นงานต้นแบบ ตอบข้อซักถาม และสะท้อนคิดปิดภาคเรียน",
      linked_worksheet_code: "PHT4-W09",
      category: "project"
    }
  ],

  DEFAULT_M5_SESSIONS: [
    {
      session_no: 1,
      title: "ปฐมนิเทศและอุณหพลศาสตร์ในร่างกายมนุษย์",
      description: "แนะนำรายวิชา ข้อตกลง กฎอุณหพลศาสตร์ และกลไกการถ่ายโอนความร้อนในสิ่งมีชีวิต",
      linked_worksheet_code: "PHT5-W01",
      category: "lecture"
    },
    {
      session_no: 2,
      title: "ปฏิบัติการวัดการถ่ายโอนความร้อนและการควบคุมอุณหภูมิ (Lab W01)",
      description: "ทดลองวัดอุณหภูมิผิวหนัง อัตราการสูญเสียความร้อน และการประคบร้อน-เย็น ส่งใบงานที่ 1",
      linked_worksheet_code: "PHT5-W01",
      category: "lab"
    },
    {
      session_no: 3,
      title: "ฟิสิกส์ของคลื่นเสียงและระบบการได้ยิน",
      description: "คลื่นเสียง ความเข้มเสียง ระดับเสียง และกลไกการทำงานของหูมนุษย์",
      linked_worksheet_code: "PHT5-W02",
      category: "lecture"
    },
    {
      session_no: 4,
      title: "คลื่นเหนือเสียงและอัลตราซาวด์ทางการแพทย์ (Lab W02)",
      description: "ปฏิบัติการวัดความถี่คลื่นอัลตราซาวด์และการสะท้อนของคลื่นในเนื้อเยื่อจำลอง ส่งใบงานที่ 2",
      linked_worksheet_code: "PHT5-W02",
      category: "lab"
    },
    {
      session_no: 5,
      title: "แสง ทัศนศาสตร์ และกลไกการมองเห็น",
      description: "การสะท้อน การหักเห เลนส์นูน เลนส์เว้า และความผิดปกติของสายตา",
      linked_worksheet_code: "PHT5-W03",
      category: "lecture"
    },
    {
      session_no: 6,
      title: "ปฏิบัติการทดสอบสายตาและการหักเหแสงผ่านเลนส์ (Lab W03)",
      description: "การทดลองวัดจุดโฟกัสเลนส์แว่นตา แผ่นวัดสายตา Snellen Chart ส่งใบงานที่ 3",
      linked_worksheet_code: "PHT5-W03",
      category: "lab"
    },
    {
      session_no: 7,
      title: "ไฟฟ้าสถิตและศักย์ไฟฟ้าเยื่อหุ้มเซลล์",
      description: "ประจุไฟฟ้า สนามไฟฟ้า ศักย์ไฟฟ้าชีวภาพ และสมการ Nernst ของเซลล์ประสาท",
      linked_worksheet_code: "PHT5-W04",
      category: "lecture"
    },
    {
      session_no: 8,
      title: "แบบจำลองสัญญาณไฟฟ้าหัวใจและ ECG (Lab W04)",
      description: "การทดลองวัดสัญญาณไฟฟ้าจำลองและการอ่านกราฟคลื่นไฟฟ้าหัวใจเบื้องต้น ส่งใบงานที่ 4",
      linked_worksheet_code: "PHT5-W04",
      category: "lab"
    },
    {
      session_no: 9,
      title: "ไฟฟ้ากระแสตรงและเซนเซอร์ชีวการแพทย์",
      description: "กฎของโอห์ม วงจรอนุกรม-ขนาน และหลักการทรานสดิวเซอร์เซนเซอร์ทางการแพทย์",
      linked_worksheet_code: "PHT5-W05",
      category: "lecture"
    },
    {
      session_no: 10,
      title: "วงจรเซนเซอร์วัดชีพจรและการเชื่อมต่อไมโครคอนโทรลเลอร์ (Lab W05)",
      description: "ปฏิบัติการประกอบวงจร PPG วัดชีพจรด้วยแสงและบันทึกสัญญาณ ส่งใบงานที่ 5",
      linked_worksheet_code: "PHT5-W05",
      category: "lab"
    },
    {
      session_no: 11,
      title: "แม่เหล็กไฟฟ้าและการเหนี่ยวนำในอุปกรณ์การแพทย์",
      description: "สนามแม่เหล็ก แรงลอเรนซ์ กฎของฟาราเดย์ และหลักการทำงานของมอเตอร์ปั๊มสารน้ำ",
      linked_worksheet_code: "PHT5-W06",
      category: "lecture"
    },
    {
      session_no: 12,
      title: "ฟิสิกส์ของการสร้างภาพด้วยคลื่นแม่เหล็กไฟฟ้า MRI (Lab W06)",
      description: "ปฏิบัติการศึกษาหลักการ Magnetic Resonance และแบบจำลองการสร้างภาพ ส่งใบงานที่ 6",
      linked_worksheet_code: "PHT5-W06",
      category: "lab"
    },
    {
      session_no: 13,
      title: "คลื่นแม่เหล็กไฟฟ้าและรังสีบำบัด",
      description: "สเปกตรัมคลื่นแม่เหล็กไฟฟ้า รังสีอินฟราเรด รังสี UV และการประยุกต์บำบัดทางกายภาพ",
      linked_worksheet_code: "PHT5-W07",
      category: "lecture"
    },
    {
      session_no: 14,
      title: "สเปกตรัมแสงและฟิสิกส์ของ Pulse Oximeter (Lab W07)",
      description: "ศึกษาการดูดกลืนแสงของฮีโมโกลบินและการวัดออกซิเจนในเลือด ส่งใบงานที่ 7",
      linked_worksheet_code: "PHT5-W07",
      category: "lab"
    },
    {
      session_no: 15,
      title: "ฟิสิกส์อะตอม รังสีเอกซ์ และการตรวจวินิจฉัย",
      description: "กำเนิดรังสีเอกซ์ การลดทอนของรังสีในกระดูกและเนื้อเยื่ออ่อน หลักการเครื่อง CT Scan",
      linked_worksheet_code: "PHT5-W08",
      category: "lecture"
    },
    {
      session_no: 16,
      title: "ความปลอดภัยทางรังสีวิทยาและเวชศาสตร์นิวเคลียร์",
      description: "การวัดปริมาณรังสี (Dosimetry) การป้องกันอันตรายจากรังสี และสารกัมมันตรังสีทางการแพทย์",
      linked_worksheet_code: "PHT5-W08",
      category: "lecture"
    },
    {
      session_no: 17,
      title: "แบบจำลองการดูดกลืนและการลดทอนรังสีในเนื้อเยื่อ (Lab W08)",
      description: "ปฏิบัติการวัดการลดทอนของแสงผ่านตัวกลางความหนาแน่นต่างๆ ส่งใบงานที่ 8",
      linked_worksheet_code: "PHT5-W08",
      category: "lab"
    },
    {
      session_no: 18,
      title: "บูรณาการโครงงานนวัตกรรมเฮลธ์เทค ม.5: การออกแบบโซลูชัน",
      description: "ระดมความคิด วิเคราะห์ปัญหา ออกแบบระบบฮาร์ดแวร์/ซอฟต์แวร์สุขภาพเทคโนโลยี",
      linked_worksheet_code: "PHT5-W09",
      category: "project"
    },
    {
      session_no: 19,
      title: "ปฏิบัติการพัฒนาชิ้นงานต้นแบบสิ่งประดิษฐ์และทดสอบ (Lab W09)",
      description: "พัฒนาต้นแบบอุปกรณ์เฮลธ์เทค ทดสอบฟังก์ชัน เก็บข้อมูลการใช้งาน ส่งใบงานที่ 9",
      linked_worksheet_code: "PHT5-W09",
      category: "project"
    },
    {
      session_no: 20,
      title: "การประกวดนำเสนอนวัตกรรมและการประเมินผลปิดภาคเรียน",
      description: "นำเสนอชิ้นงานต้นแบบต่อคณะครูผู้ประเมินและสะท้อนผลการเรียนรู้รายบุคคล",
      linked_worksheet_code: "PHT5-W09",
      category: "project"
    }
  ],

  getDefaultSessions(grade) {
    const list = grade === "M5" ? this.DEFAULT_M5_SESSIONS : this.DEFAULT_M4_SESSIONS;
    return JSON.parse(JSON.stringify(list));
  },

  listSessions(session, payload, repository) {
    const { academic_year_id, grade } = payload || {};
    if (!academic_year_id || !grade) {
      throw new Error("INVALID_REQUEST: โปรดระบุ academic_year_id และ grade");
    }

    const snapshot = repository.findSessionSnapshot(academic_year_id, grade);
    if (snapshot && snapshot.sessions_json) {
      let sessions = [];
      try {
        sessions = typeof snapshot.sessions_json === "string" 
          ? JSON.parse(snapshot.sessions_json) 
          : snapshot.sessions_json;
      } catch (e) {
        sessions = this.getDefaultSessions(grade);
      }
      return {
        ok: true,
        data: {
          academic_year_id,
          grade,
          is_snapshot: true,
          version_no: snapshot.version_no || 1,
          updated_at: snapshot.updated_at || snapshot.created_at,
          sessions
        }
      };
    }

    // Default template fallback if no snapshot recorded yet
    return {
      ok: true,
      data: {
        academic_year_id,
        grade,
        is_snapshot: false,
        version_no: 0,
        updated_at: null,
        sessions: this.getDefaultSessions(grade)
      }
    };
  },

  saveSnapshot(session, payload, repository) {
    Authorization.enforceTeacher(session);
    const { academic_year_id, grade, sessions } = payload || {};

    if (!academic_year_id || !grade) {
      throw new Error("INVALID_REQUEST: โปรดระบุ academic_year_id และ grade");
    }
    if (!Array.isArray(sessions) || sessions.length === 0) {
      throw new Error("INVALID_SESSIONS: ข้อมูลรายการแผนการเรียนต้องเป็น Array และไม่ว่างเปล่า");
    }

    // Sanitize sessions list
    const sanitizedSessions = sessions.map((s, idx) => ({
      session_no: s.session_no || (idx + 1),
      title: String(s.title || "").trim(),
      description: String(s.description || "").trim(),
      linked_worksheet_code: s.linked_worksheet_code ? String(s.linked_worksheet_code).trim() : "",
      category: s.category || "lecture"
    }));

    const existing = repository.findSessionSnapshot(academic_year_id, grade);
    const now = new Date().toISOString();
    const versionNo = existing ? ((existing.version_no || 1) + 1) : 1;
    const snapshotId = existing ? existing.snapshot_id : `snp_${academic_year_id}_${grade}_${Date.now()}`;

    const record = {
      snapshot_id: snapshotId,
      academic_year_id,
      grade,
      version_no: versionNo,
      sessions_json: JSON.stringify(sanitizedSessions),
      created_at: existing ? existing.created_at : now,
      updated_at: now,
      updated_by_uid: session.principal_uid || "teacher"
    };

    repository.saveSessionSnapshot(record);

    return {
      ok: true,
      data: {
        snapshot_id: snapshotId,
        academic_year_id,
        grade,
        version_no: versionNo,
        updated_at: now,
        count: sanitizedSessions.length,
        message_th: `บันทึก Snapshot แผนการเรียนรู้ประจำปีการศึกษา ${academic_year_id} (${grade}) เรียบร้อยแล้ว (เวอร์ชัน ${versionNo})`
      }
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = SessionService;
}

