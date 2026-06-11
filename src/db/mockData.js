/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { initialClasses, initialSubjects, initialUsers, initialExams, initialQuestions, initialAnnouncements, initialResources, initialNotifications, initialAuditLogs } from "../data";
// Map initial roles to uppercase and transform fullName/name
export const INITIAL_USERS = initialUsers.map((u) => {
    let mappedRole = "STUDENT";
    if (u.role === "admin")
        mappedRole = "ADMIN";
    if (u.role === "enseignant")
        mappedRole = "TEACHER";
    return {
        ...u,
        fullName: u.name, // Ensure fullName field exists
        role: mappedRole
    };
});
export const INITIAL_SUBJECTS = initialSubjects;
export const INITIAL_CLASSES = initialClasses;
export const INITIAL_EXAMS = initialExams;
export const INITIAL_SUBMISSIONS = [];
export const INITIAL_AUDIT_LOGS = initialAuditLogs;
export const INITIAL_ANNOUNCEMENTS = initialAnnouncements;
export const INITIAL_RESOURCES = initialResources;
export const INITIAL_NOTIFICATIONS = initialNotifications.map((n) => {
    let mappedType = "INFO";
    if (n.type === "alert" || n.type === "warning")
        mappedType = "DANGER";
    if (n.type === "success")
        mappedType = "VALIDATION";
    return {
        ...n,
        message: n.content, // Ensure message field exists
        type: mappedType
    };
});
export const getStored = (key, fallback) => {
    const val = localStorage.getItem(key);
    if (val) {
        try {
            return JSON.parse(val);
        }
        catch {
            return fallback;
        }
    }
    return fallback;
};
export const setStored = (key, val) => {
    localStorage.setItem(key, JSON.stringify(val));
};
export const initializeMockDB = () => {
    // Perform synchronization logic if empty
    if (!localStorage.getItem("qt_users")) {
        setStored("qt_users", INITIAL_USERS);
    }
    if (!localStorage.getItem("qt_subjects")) {
        setStored("qt_subjects", INITIAL_SUBJECTS);
    }
    if (!localStorage.getItem("qt_classes")) {
        setStored("qt_classes", INITIAL_CLASSES);
    }
    if (!localStorage.getItem("qt_exams")) {
        setStored("qt_exams", INITIAL_EXAMS);
    }
    if (!localStorage.getItem("qt_questions")) {
        setStored("qt_questions", initialQuestions);
    }
    if (!localStorage.getItem("qt_submissions")) {
        setStored("qt_submissions", INITIAL_SUBMISSIONS);
    }
    if (!localStorage.getItem("qt_audit_logs")) {
        setStored("qt_audit_logs", INITIAL_AUDIT_LOGS);
    }
    if (!localStorage.getItem("qt_notifications")) {
        setStored("qt_notifications", INITIAL_NOTIFICATIONS);
    }
    if (!localStorage.getItem("qt_announcements")) {
        setStored("qt_announcements", INITIAL_ANNOUNCEMENTS);
    }
    if (!localStorage.getItem("qt_resources")) {
        setStored("qt_resources", INITIAL_RESOURCES);
    }
};
