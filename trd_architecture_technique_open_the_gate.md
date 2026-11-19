# Technical Requirements Document (TRD)
**Projet :** Application de Test de Niveau d'Anglais – **OPEN THE GATE**  
**Version :** 1.0  
**Statut :** Brouillon initial  

---

## 1. Architecture Générale
L'application reposera sur une architecture **Client-Serveur moderne (SPA / Full-Stack)** découplée via une API RESTful, garantissant rapidité, scalabilité et facilité de maintenance.

* **Frontend :** Application Web Responsive (Mobile-First).
* **Backend :** API REST sécurisée gérant la logique métier, le moteur de test et le scoring.
* **Base de données :** Base relationnelle pour la structuration stricte des questions, sessions et résultats.
* **Stockage Médias :** Stockage objet (Cloud Storage) pour les fichiers audio (Listening) et les attestations PDF générées.

---

## 2. Stack Technique Recommandée

### 2.1 Frontend
* **Framework :** React.js (avec Next.js ou Vite) ou Vue.js 3.
* **Styling :** Tailwind CSS (pour un développement rapide et responsive).
* **Gestion d'état :** Zustand ou Redux Toolkit (crucial pour maintenir l'état du test et le chronomètre en local).

### 2.2 Backend
* **Environnement / Framework :** Node.js (NestJS ou Express) ou Python (FastAPI / Django).
* **Authentification :** JWT (JSON Web Tokens) pour l'espace Administrateur ; Token de session temporaire pour les étudiants passant le test.
* **Génération PDF :** `PDFKit`, `Puppeteer` ou `WeasyPrint` pour générer l'attestation de niveau.

### 2.3 Base de Données & Infrastructure
* **SGBD :** PostgreSQL (fiabilité, support JSONB pour les options de réponses).
* **Stockage fichiers :** AWS S3, Cloudflare R2 ou Supabase Storage (pour l'hébergement des fichiers `.mp3`).
* **Hébergement :** Vercel / Netlify (Frontend) + Render / Railway / AWS (Backend & BDD).

---

## 3. Modèle de Données (Schéma Conceptuel)

### `Users` (Administrateurs & Étudiants)
* `id` (UUID, PK)
* `full_name` (VARCHAR)
* `email` (VARCHAR, Unique)
* `phone` (VARCHAR)
* `role` (ENUM: `ADMIN`, `STUDENT`)
* `learning_goal` (VARCHAR, nullable)
* `created_at` (TIMESTAMP)

### `Questions`
* `id` (UUID, PK)
* `skill_type` (ENUM: `GRAMMAR`, `VOCABULARY`, `READING`, `LISTENING`)
* `cefr_level` (ENUM: `A1`, `A2`, `B1`, `B2`, `C1`, `C2`)
* `question_text` (TEXT)
* `context_text` (TEXT, nullable - pour les textes de Reading)
* `media_url` (VARCHAR, nullable - URL du fichier audio)
* `options` (JSONB - ex: `[{"id": "a", "text": "..."}, ...]`)
* `correct_option_id` (VARCHAR)
* `points` (INT)
* `is_active` (BOOLEAN)

### `TestSessions`
* `id` (UUID, PK)
* `user_id` (UUID, FK -> `Users.id`)
* `status` (ENUM: `IN_PROGRESS`, `COMPLETED`, `EXPIRED`)
* `started_at` (TIMESTAMP)
* `completed_at` (TIMESTAMP, nullable)
* `total_score` (INT)
* `assigned_cefr_level` (ENUM: `A1`, `A2`, `B1`, `B2`, `C1`, `C2`)
* `certificate_url` (VARCHAR, nullable)

### `UserAnswers`
* `id` (UUID, PK)
* `session_id` (UUID, FK -> `TestSessions.id`)
* `question_id` (UUID, FK -> `Questions.id`)
* `selected_option_id` (VARCHAR)
* `is_correct` (BOOLEAN)
* `answered_at` (TIMESTAMP)

---

## 4. Spécifications des APIs Principales

### Endpoints Publics / Étudiants
* `POST /api/v1/sessions/start` : Enregistre les infos de l'étudiant, crée une session et renvoie le premier lot de questions.
* `POST /api/v1/sessions/:id/answer` : Enregistre la réponse à une question (permet la sauvegarde en temps réel et le calcul adaptatif).
* `POST /api/v1/sessions/:id/submit` : Clôture le test, déclenche l'algorithme de notation final et génère le certificat PDF.
* `GET /api/v1/sessions/:id/result` : Récupère le bilan détaillé et le lien vers le PDF.

### Endpoints Administration (Protégés par JWT)
* `POST /api/v1/admin/login` : Authentification administrateur.
* `GET / POST / PUT / DELETE /api/v1/admin/questions` : Gestion complète de la banque de questions.
* `POST /api/v1/admin/upload-media` : Upload sécurisé des fichiers audio vers le stockage cloud.
* `GET /api/v1/admin/analytics` : Récupération des statistiques globales et export CSV des candidats.

---

## 5. Logique Métier & Sécurité

### 5.1 Algorithme d'Évaluation (Test Adaptatif Simplifié)
1. Le test démarre au niveau intermédiaire (**B1**).
2. Si l'étudiant répond correctement à une série de questions, la difficulté augmente (**B2** -> **C1**). En cas d'erreurs répétées, elle diminue (**A2** -> **A1**).
3. À la fin des 25 à 30 questions, le score pondéré par niveau de difficulté détermine le niveau CECRL final.

### 5.2 Mesures de Sécurité
* **Protection des réponses :** Le champ `correct_option_id` n'est **jamais** envoyé au Frontend lors de la passation du test. La vérification se fait uniquement côté serveur.
* **Validation temporelle :** Le serveur vérifie la différence entre `started_at` et `submitted_at` pour empêcher le contournement du chronomètre côté client.
* **Rate Limiting :** Limitation des requêtes sur `/sessions/start` pour éviter le spam de création de comptes.
* **CORS & HTTPS :** Chiffrement SSL/TLS obligatoire et restriction des origines autorisées.