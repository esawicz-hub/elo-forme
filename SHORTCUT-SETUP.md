# Setup Raccourci iOS — Push auto Apple Health → app

Une fois en place, ton iPhone enverra automatiquement chaque soir à 22h tes stats Watch (pas, distance, kcal active, minutes sport, heures debout) à ton app `elo-forme.vercel.app`.

Setup une fois, ça tourne ensuite tout seul.

---

## Étape 1 — Générer ton token secret (10 sec)

Ouvre Terminal sur ton ordi et tape :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ça affiche une longue chaîne aléatoire (ex: `a3f9b8...`). **Copie-la et garde-la sous la main**, on va l'utiliser deux fois.

---

## Étape 2 — Ajouter le token dans Vercel

1. Va sur https://vercel.com/esawicz-hubs-projects/elo-forme/settings/environment-variables
2. Clique **Add Environment Variable**
3. Key : `HEALTH_TOKEN`
4. Value : *colle ta chaîne aléatoire de l'étape 1*
5. Environments : coche **Production** + **Preview** + **Development**
6. **Save**
7. Onglet **Deployments** → triple point sur le dernier deploy → **Redeploy**

---

## Étape 3 — Créer le Raccourci sur ton iPhone

1. Ouvre l'app **Raccourcis** (icône violette, déjà installée par défaut)
2. Onglet **Mes raccourcis** en bas → bouton **+** en haut à droite
3. Renomme le raccourci en haut → **Push Watch → Elo Forme**

Maintenant on ajoute des actions, dans l'ordre :

### Action 1 : Date du jour
- Tape **+ Ajouter une action** → cherche **Date** → choisis **Date**
- Modifie pour **Date actuelle**

### Action 2 : Formater la date
- **+ Ajouter une action** → cherche **Mettre en forme la date** → choisis-la
- Format de date : **Personnalisé**
- Format : `yyyy-MM-dd`
- Date : *clique sur le champ et choisis "Date" (de l'action 1)*

### Action 3-7 : Récupérer les stats Health (5 actions similaires)

Pour CHAQUE métrique ci-dessous, ajoute **Obtenir des statistiques sanitaires** (cherche "Obtenir statistiques") :

| Type d'échantillon | Statistique | Période |
|---|---|---|
| Compte de pas | Somme | Aujourd'hui |
| Énergie active | Somme | Aujourd'hui |
| Distance de marche + course | Somme | Aujourd'hui |
| Temps d'exercice Apple | Somme | Aujourd'hui |
| Heures debout Apple | Somme | Aujourd'hui |

→ Tu auras 5 actions "Obtenir statistiques" qui se suivent.

**Astuce** : après chaque action, renomme la variable de sortie en cliquant dessus (ex: "Statistiques" → "Pas", puis "Kcal", "Distance", "Exercice", "Debout"). Ça facilite la suite.

### Action 8 : Construire le JSON

- **+ Ajouter une action** → cherche **Dictionnaire** → choisis **Dictionnaire**
- Tape **+** dans le dictionnaire pour ajouter chaque clé :
  - Type **Nombre** → clé `steps` → valeur **Pas** (variable)
  - Type **Nombre** → clé `activeKcal` → valeur **Kcal**
  - Type **Nombre** → clé `distance` → valeur **Distance**
  - Type **Nombre** → clé `exerciseMin` → valeur **Exercice**
  - Type **Nombre** → clé `standHours` → valeur **Debout**
  - Type **Texte** → clé `date` → valeur *Date formatée* (de l'action 2)

### Action 9 : Envoyer à l'API

- **+ Ajouter une action** → cherche **Obtenir le contenu de l'URL** → choisis-la
- URL : `https://elo-forme.vercel.app/api/health`
- Touche le ▾ pour développer les options
- Méthode : **POST**
- En-têtes : ajoute deux entrées :
  - `Authorization` : `Bearer ` + ta chaîne de l'étape 1 *(garde l'espace après Bearer !)*
  - `Content-Type` : `application/json`
- Demande : **JSON**
- Corps de la demande : *clique le champ et choisis "Dictionnaire" (de l'action 8)*

### Action 10 (optionnel) : notification de confirmation

- **+ Ajouter une action** → cherche **Afficher une notification**
- Texte : `Watch synced ✓`

---

## Étape 4 — Tester le raccourci

1. Touche le ▶ en haut à droite du raccourci
2. iOS te demande l'autorisation d'accéder à Health → **Autoriser**
3. iOS te demande de te connecter à elo-forme.vercel.app → **Autoriser**
4. Si tout est OK, la notification "Watch synced ✓" apparaît
5. Ouvre `elo-forme.vercel.app` → la card **Activité Watch** doit apparaître avec tes chiffres du jour 🎉

Si ça plante, regarde le détail de l'erreur dans Raccourcis. Les causes courantes :
- Token mal collé dans Vercel ou dans le raccourci
- Vercel pas redéployé après ajout du token
- Permissions Health refusées (vérifie Réglages → Confidentialité → Santé → Raccourcis)

---

## Étape 5 — Automatiser pour 22h tous les jours

1. Dans **Raccourcis**, onglet **Automatisation** en bas
2. **+** en haut à droite → **Créer une automatisation personnelle**
3. **Heure du jour** → 22:00 → **Quotidiennement** → **Suivant**
4. **Ajouter une action** → cherche **Exécuter le raccourci** → choisis-le
5. Raccourci : **Push Watch → Elo Forme**
6. Désactive **"Demander avant d'exécuter"** (sinon tu auras une notif chaque soir à confirmer)
7. **Suivant** → **Terminé**

Voilà — chaque soir à 22h ton iPhone enverra tes stats Watch à l'app, sans rien faire de ta part.

---

## Re-test rapide

- Va dans Raccourcis → tape sur ton automatisation → ▶ pour la lancer manuellement
- Recharge `elo-forme.vercel.app` sur ton ordi → la card Watch s'affiche avec les chiffres du jour

Si tu as un souci à n'importe quelle étape, fais une capture d'écran et envoie-la moi.
