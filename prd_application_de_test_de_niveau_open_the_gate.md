# Product Requirements Document (PRD)
**Projet :** Application de Test de Niveau d'Anglais – **OPEN THE GATE**  
**Version :** 1.0  
**Statut :** Brouillon initial  

---

## 1. Contexte et Objectifs
### 1.1 Contexte
**OPEN THE GATE** souhaite proposer une plateforme numérique moderne, fluide et accessible permettant aux étudiants (et candidats potentiels) d'évaluer rapidement et avec précision leur niveau de maîtrise de la langue anglaise selon le cadre européen commun de référence pour les langues (CECRL : A1 à C2).

### 1.2 Objectifs du Produit
* **Pour l'étudiant :** Obtenir une évaluation fiable, immédiate et gratuite (ou sur inscription) de son niveau d'anglais, accompagnée de recommandations personnalisées de cours.
* **Pour OPEN THE GATE :** Automatiser le processus de placement pédagogique, qualifier les prospects (génération de leads) et orienter efficacement les étudiants vers les programmes adaptés.

---

## 2. Public Cible (Personas)
1. **L'Étudiant / Candidat (Utilisateur principal) :** Veut connaître son niveau actuel avant de s'inscrire à une formation, préparer un examen ou enrichir son CV. Cherche une expérience rapide (15-25 min) et compatible mobile.
2. **L'Administrateur Pédagogique (OPEN THE GATE) :** Gère la banque de questions, consulte les statistiques de réussite, ajuste les seuils de notation et exporte les résultats des candidats.

---

## 3. Parcours Utilisateur (User Flow)
1. **Page d'accueil :** Présentation du test, durée estimée, consignes et bouton « Commencer le test ».
2. **Identification (Lead Capture) :** Formulaire rapide (Nom, Prénom, Email, Numéro de téléphone/WhatsApp, Objectif d'apprentissage).
3. **Passation du test :**
   * Section 1 : Grammaire & Vocabulaire (QCM).
   * Section 2 : Compréhension écrite (Reading - textes courts + questions).
   * Section 3 : Compréhension orale (Listening - extraits audio + questions).
   * *(Optionnel)* Section 4 : Expression écrite courte (Writing) ou orale (Speaking) pour les niveaux avancés.
4. **Écran de résultats :**
   * Affichage du niveau CECRL estimé (ex: **B1 - Intermédiaire**).
   * Score détaillé par compétence.
   * Recommandation du programme OPEN THE GATE correspondant.
   * Option de téléchargement d'une attestation PDF et partage.

---

## 4. Exigences Fonctionnelles

### 4.1 Module Étudiant (Front-Office)
* **F1 - Inscription simplifiée :** Validation des champs obligatoires avant le démarrage.
* **F2 - Moteur de test adaptatif ou progressif :**
  * Système de difficulté progressive (les questions s'adaptent aux réponses) ou test linéaire par paliers.
  * Chronomètre global ou par section avec soumission automatique à la fin du temps imparti.
  * Lecteur audio intégré avec limitation du nombre d'écoutes (ex: max 2 écoutes par extrait).
* **F3 - Calcul et affichage des résultats :** Algorithme de scoring instantané convertissant les points en niveau CECRL (A1, A2, B1, B2, C1, C2).
* **F4 - Génération d'attestation :** Création automatique d'un certificat de niveau au format PDF avec identifiant unique.

### 4.2 Module Administration (Back-Office)
* **F5 - Gestion de la banque de questions (CRUD) :** Ajout, modification, suppression et catégorisation des questions (Compétence, Niveau CECRL, Points, Médias audio/image).
* **F6 - Tableau de bord et Analytics :** Nombre de tests passés, répartition des niveaux, taux d'abandon, liste des prospects avec filtres.
* **F7 - Export des données :** Export CSV/Excel des résultats et contacts des étudiants.

---

## 5. Exigences Non-Fonctionnelles
* **Ergonomie & Responsive Design :** Interface intuitive (Mobile-First), accessible sur smartphone, tablette et ordinateur.
* **Performance :** Temps de chargement des pages inférieur à 2 secondes ; préchargement des fichiers audio.
* **Sécurité & Anti-triche :** Désactivation du clic droit/copier-coller pendant le test, mélange aléatoire des questions et des choix de réponses, protection des données personnelles (RGPD / lois locales).
* **Disponibilité :** Tolérance aux micro-coupures internet (sauvegarde locale de la progression en cours).

---

## 6. Indicateurs de Performance (KPIs)
* Taux de complétion du test (objectif : > 80 %).
* Nombre de nouveaux étudiants inscrits suite au test (taux de conversion).
* Temps moyen de passation du test.