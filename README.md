# OPEN THE GATE – Application de Test de Niveau d'Anglais (CECRL)

Plateforme d'évaluation linguistique et de certification pour l'académie **OPEN THE GATE**, conforme au **Cadre Européen Commun de Référence pour les Langues (CECRL : A1 à C2)**.

---

## 🌟 Fonctionnalités Clés

### 🎓 Côté Étudiant (Front-Office)
1. **Landing Page Moderne & Responsive :**
   - Présentation de la valeur pédagogique, de la durée estimée (15-20 min) et des paliers CECRL.
2. **Formulaire de Qualification (Lead Capture) :**
   - Collecte : Nom complet, Email, Téléphone / WhatsApp, Objectif d'apprentissage.
3. **Moteur d'Évaluation en 4 Compétences :**
   - **Grammaire & Syntaxe** (temps, passif, inversion, conditionnels).
   - **Vocabulaire & Idiomes** (registres formels, collocations, faux-amis).
   - **Compréhension Écrite (Reading)** (articles, correspondances et déductions).
   - **Compréhension Orale (Listening)** (synthèse vocale anglaise native intégrée, limitation stricte à 2 écoutes par extrait).
4. **Sécurité & Anti-Triche :**
   - Désactivation du clic droit et du copier-coller pendant le test.
   - Les bonnes réponses (`correct_option_id`) ne sont **jamais transmises au navigateur**.
   - Sauvegarde temps réel de chaque réponse contre les micro-coupures réseau.
   - Chronomètre global avec auto-soumission à expiration.
5. **Résultats Immédiats & Attestation Officielle :**
   - Badge CECRL (A1, A2, B1, B2, C1, C2).
   - Graphique de performance détaillé par compétence (%).
   - Recommandation pédagogique sur-mesure du catalogue OPEN THE GATE.
   - Téléchargement instantané de l'**Attestation Officielle au format PDF** avec identifiant unique de vérification.
   - Bouton de contact direct WhatsApp pré-rempli.

---

### 👨‍💼 Côté Administration (Back-Office Pédagogique)
1. **Authentification Sécurisée par JWT :**
   - Identifiants pré-configurés :
     - **Email :** `admin@openthegate.com`
     - **Mot de passe :** `AdminGate2026!`
2. **Tableau de Bord & KPIs :**
   - Nombre de candidats, tests complétés, taux d'abandon/complétion, score moyen.
   - Histogramme de répartition des niveaux CECRL (A1 à C2).
3. **Gestion des Leads & Résultats :**
   - Liste des étudiants avec filtres par niveau et recherche textuelle.
   - Téléchargement direct des attestations PDF des candidats.
   - **Export CSV / Excel** en un clic avec encodage UTF-8 BOM.
4. **Gestion de la Banque de Questions (CRUD) :**
   - Filtrage par compétence et par niveau.
   - Ajout, modification, suppression et gestion des options avec pondération des points.

---

## 🛠️ Architecture & Stack Technique

- **Frontend :** React 19, Vite, Tailwind CSS, Lucide Icons, Canvas-Confetti.
- **Backend :** Node.js, Express, JWT, Bcrypt, PDFKit.
- **Base de Données :** SQLite avec schéma relationnel strict (`users`, `questions`, `test_sessions`, `user_answers`).
- **Génération PDF :** Service vectoriel haute résolution avec filigrane, sceau numérique et identifiant unique.

---

## 🚀 Démarrage Rapide

### Option 1 : Lancement direct sous Windows
Double-cliquez simplement sur le fichier :
```cmd
demarrer.bat
```
L'application se lance et s'ouvre automatiquement dans votre navigateur sur `http://localhost:5000`.

### Option 2 : Ligne de commande
```bash
# Démarrer le serveur et l'application
npm run start
```
Accédez ensuite à : **[http://localhost:5000](http://localhost:5000)**

### Option 3 : Mode Développement (HMR Vite)
```bash
# Terminal 1 : Backend API
cd server
npm run dev

# Terminal 2 : Frontend Vite
cd client
npm run dev
```

---

## 🔑 Identifiants Démo Administrateur
- **URL :** Cliquez sur « Espace Pédagogique » dans la barre de navigation ou accédez au tableau de bord.
- **Email :** `admin@openthegate.com`
- **Mot de passe :** `AdminGate2026!`
