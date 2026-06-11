export const initialClasses = [
    { id: "cl1", name: "Génie Logiciel - 3ème Année", level: "L3" },
    { id: "cl2", name: "Cyber-Sécurité & Systèmes - 4ème Année", level: "M1" },
    { id: "cl3", name: "Intelligence Artificielle - 5ème Année", level: "M2" }
];
export const initialSubjects = [
    { id: "sub1", name: "Développement Web & Frameworks" },
    { id: "sub2", name: "Algorithmique & Structures de Données" },
    { id: "sub3", name: "Bases de Données Relationnelles & SQL" },
    { id: "sub4", name: "Sécurité Routage & Réseaux" }
];
export const initialUsers = [
    {
        id: "admin-1",
        name: "Yassmine Chraibi",
        email: "support@hightech.edu",
        role: "admin"
    },
    {
        id: "prof-1",
        name: "Prof. Fatima Zahra Idrissi",
        email: "f.idrissi@hightech.edu",
        role: "enseignant"
    },
    {
        id: "prof-2",
        name: "Prof. Dr. Amine Benjelloun",
        email: "a.benjelloun@hightech.edu",
        role: "enseignant"
    },
    {
        id: "student-1",
        name: "Youssef El Amrani",
        email: "youssef@hightech.edu",
        role: "etudiant",
        classId: "cl1"
    },
    {
        id: "student-2",
        name: "Rkia Julia",
        email: "rkiajulia85@gmail.com",
        role: "etudiant",
        classId: "cl1"
    },
    {
        id: "student-3",
        name: "Reda Benslimane",
        email: "reda@hightech.edu",
        role: "etudiant",
        classId: "cl1"
    },
    {
        id: "student-4",
        name: "Salma Bennani",
        email: "salma@hightech.edu",
        role: "etudiant",
        classId: "cl2"
    }
];
export const initialExams = [
    {
        id: "ex-web",
        title: "Examen Final de Développement Web JS",
        description: "Cet examen teste vos compétences en JavaScript moderne (ES6+), manipulation du DOM, et programmation asynchrone.",
        subjectId: "sub1",
        duration: 30, // 30 minutes
        startDate: "2026-06-01T08:00:00Z",
        endDate: "2026-06-30T18:00:00Z", // Active exam
        isActive: true,
        authorId: "prof-1",
        totalPoints: 20
    },
    {
        id: "ex-algo",
        title: "Évaluation Majeure : Algorithmique & C++",
        description: "Validation des connaissances sur les structures de données (Piles, Files, Graphes) et l'implémentation de tris récursifs complexes.",
        subjectId: "sub2",
        duration: 15, // 15 mins
        startDate: "2026-05-10T10:00:00Z", // Passed / Expired
        endDate: "2026-05-30T12:00:00Z",
        isActive: true,
        authorId: "prof-1",
        totalPoints: 10
    },
    {
        id: "ex-future",
        title: "Contrôle Suivi : Cyber-Sécurité & Routage",
        description: "Ce test de routine valide vos acquis sur les architectures réseaux sécurisées, pare-feu et les ports de communication usuels.",
        subjectId: "sub4",
        duration: 60,
        startDate: "2026-06-25T09:00:00Z", // Future exam (EF1 behavior testing)
        endDate: "2026-06-25T11:00:00Z",
        isActive: true,
        authorId: "prof-2",
        totalPoints: 10
    }
];
export const initialQuestions = [
    // Exam JS Web Questions
    {
        id: "q-web-1",
        examId: "ex-web",
        type: "qcm",
        prompt: "Parmi les déclarations suivantes concernant le mot-clé 'const' en JS, lesquelles sont VRAIES ? (Plusieurs réponses possibles)",
        points: 4,
        options: [
            "Il empêche de réassigner complètement la variable",
            "Il empêche la mutation des propriétés internes d'un objet ainsi déclaré",
            "La variable possède une portée de bloc (block scope)",
            "La variable est hissée (hoisted) à l'état non-initialisé (Temporal Dead Zone)"
        ],
        correctOptions: [0, 2, 3]
    },
    {
        id: "q-web-2",
        examId: "ex-web",
        type: "vrai_faux",
        prompt: "En JavaScript, l'égalité '[] == false' s'évalue à 'true' lors de la coercition de type.",
        points: 3,
        correctBool: true
    },
    {
        id: "q-web-3",
        examId: "ex-web",
        type: "reponse_courte",
        prompt: "Quelle valeur de type chaîne (string) est retournée par l'instruction : 'typeof []' ?",
        points: 3,
        correctShortAnswers: ["object", "l'objet", "Object"]
    },
    {
        id: "q-web-4",
        examId: "ex-web",
        type: "ouverte",
        prompt: "Expliquez avec précision et des exemples concrets la différence clé entre une exécution synchrone bloquante et l'asynchronisme de boucle d'événement (Event Loop) en JavaScript.",
        points: 5
    },
    {
        id: "q-web-5",
        examId: "ex-web",
        type: "programmation",
        prompt: "Écrivez une fonction nommée 'sommePairs(tableau)' prenant un tableau de nombres entiers en paramètre et retournant la somme exacte de tous les nombres PAIRS présents dans ce tableau.",
        points: 5,
        codingLanguage: "javascript",
        starterCode: `function sommePairs(tableau) {\n  // Écrivez votre code de programmation ici\n  \n}`,
        testCases: [
            { input: "[1, 2, 3, 4, 5, 6]", output: "6" },
            { input: "[11, 15, 17, 22, 10]", output: "32" },
            { input: "[1, 3, 5]", output: "0" }
        ]
    },
    // Exam Algo C++ Questions
    {
        id: "q-algo-1",
        examId: "ex-algo",
        type: "qcm",
        prompt: "Dans une Pile (Stack), le mode d'insertion et retrait de l'information est de type :",
        points: 3,
        options: [
            "FIFO (First In First Out)",
            "LIFO (Last In First Out)",
            "LILO (Last In Last Out)",
            "Aléatoire"
        ],
        correctOptions: [1]
    },
    {
        id: "q-algo-2",
        examId: "ex-algo",
        type: "vrai_faux",
        prompt: "Un graphe orienté sans cycle (DAG) possède toujours au moins un tri topologique possible.",
        points: 3,
        correctBool: true
    },
    {
        id: "q-algo-3",
        examId: "ex-algo",
        type: "programmation",
        prompt: "Écrivez une fonction nommée 'trouverMaximum(tableau)' retournant le plus grand nombre présent dans le tableau d'entrée.",
        points: 4,
        codingLanguage: "javascript",
        starterCode: `function trouverMaximum(tableau) {\n  // Votre code ici\n}`,
        testCases: [
            { input: "[10, 4, -4, 99, 13]", output: "99" },
            { input: "[-5, -12, -1]", output: "-1" }
        ]
    }
];
export const initialAnnouncements = [
    {
        id: "ann-1",
        title: "Lancement officiel de QuizTech !",
        content: "Bienvenue à tous sur la nouvelle plateforme de gestion et passage des examens en ligne de HighTech School. S'assurer d'avoir un débit stable pendant les épreuves.",
        date: "2026-06-08T10:00:00Z",
        authorName: "Yassmine Chraibi",
        role: "Administratrice QuizTech"
    },
    {
        id: "ann-2",
        title: "Rappel Aménagement Temps Tiers-Temps",
        content: "Les étudiants bénéficiant d'un aménagement tiers-temps officiel sont invités à contacter l'administration afin que le temps de session soit adapté sur la plateforme par l'enseignant.",
        date: "2026-06-09T14:30:00Z",
        authorName: "Prof. Fatima Zahra Idrissi",
        role: "Enseignante"
    }
];
export const initialResources = [
    {
        id: "res-1",
        title: "Fiche Mémo : ES6+ JavaScript Patterns",
        fileUrl: "https://hightech.edu/resources/js-memo.pdf",
        type: "pdf",
        subjectId: "sub1",
        authorName: "Prof. Fatima Zahra Idrissi",
        date: "2026-06-05T11:00:00Z"
    },
    {
        id: "res-2",
        title: "Structures de données en C++ - Slides Cours",
        fileUrl: "https://hightech.edu/resources/cpp-slides.pdf",
        type: "pdf",
        subjectId: "sub2",
        authorName: "Prof. Fatima Zahra Idrissi",
        date: "2026-05-15T09:00:00Z"
    }
];
export const initialAuditLogs = [
    {
        id: "log-1",
        timestamp: "2026-06-10T12:00:00Z",
        userId: "admin-1",
        userName: "Yassmine Chraibi",
        action: "Création de la classe",
        details: "Classe GL-3A créée avec succès dans l'annuaire."
    },
    {
        id: "log-2",
        timestamp: "2026-06-10T14:15:00Z",
        userId: "prof-1",
        userName: "Prof. Fatima Zahra Idrissi",
        action: "Ajout d'examen",
        details: "Création de l'examen final de développement Web JS."
    }
];
export const initialNotifications = [
    {
        id: "not-1",
        title: "Nouvel Examen Assigné !",
        content: "L'examen 'Développement Web JS' a été publié et est disponible pour votre session de classe Génénie Logiciel.",
        date: "2026-06-10T15:00:00Z",
        isRead: false,
        userId: "student-1",
        type: "info"
    },
    {
        id: "not-2",
        title: "Évaluation Validée",
        content: "Votre examen d'Algorithmique & C++ a été corrigé. Vous pouvez consulter votre note de 9/10 dans votre historique.",
        date: "2026-06-10T10:00:00Z",
        isRead: false,
        userId: "student-1",
        type: "success"
    }
];
