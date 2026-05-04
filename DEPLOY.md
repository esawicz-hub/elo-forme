# Déployer "On reprend la forme" sur Vercel

Guide pas à pas — environ 10 minutes la première fois.

---

## Ce qu'on va faire

1. Importer le dossier `elo-forme-app` dans Vercel
2. Activer Vercel KV (la base de sync) et lier au projet
3. Récupérer l'URL → l'ajouter à l'écran d'accueil iPhone

---

## 1. Créer le projet sur Vercel

### Option A — Via le navigateur (le plus simple)

1. Va sur https://vercel.com/new
2. Clique **"Browse"** ou glisse-dépose le dossier `elo-forme-app/` complet
   - Si tu préfères passer par GitHub : crée un repo, push le dossier, puis "Import Git Repository"
3. Nom du projet : **`elo-forme`** (ça donnera l'URL `elo-forme.vercel.app`)
4. **Framework Preset** : laisse sur "Other" (Vercel détecte automatiquement)
5. **Root Directory** : laisse vide (racine du projet)
6. Clique **Deploy**

### Option B — Via la CLI Vercel (si tu l'as déjà installée)

```bash
cd "/Users/elodiesawicz/Documents/Claude/Projects/On reprend la forme !/elo-forme-app"
npx vercel
# → suivre les prompts, choisir le compte esawicz-hubs-projects, nommer le projet "elo-forme"
```

Une fois déployé, tu auras une URL comme `https://elo-forme.vercel.app`. **Ne va pas encore tester** — la sync ne marchera pas tant que la KV n'est pas branchée. C'est l'étape suivante.

---

## 2. Activer Vercel KV (sync des données)

1. Dans le dashboard Vercel, ouvre ton projet **elo-forme**
2. Onglet **Storage** (en haut)
3. Clique **Create Database** → choisis **KV** (Redis-compatible)
4. Nom : `elo-forme-kv`, région : Paris (cdg1) ou la plus proche
5. Clique **Create**
6. **Connect to Project** → sélectionne `elo-forme` → **Connect**
7. Sélectionne tous les environnements (Production, Preview, Development) → **Connect**

Vercel ajoute automatiquement les variables d'environnement `KV_*` au projet. Plus rien à configurer.

---

## 3. Re-déployer pour que la KV soit prise en compte

Onglet **Deployments** → sur le dernier déploiement, clique sur les **trois points (⋯)** → **Redeploy** → confirme.

Attends ~30 secondes que ça finisse.

---

## 4. Tester sur ton ordi

Ouvre `https://elo-forme.vercel.app` dans Safari/Chrome.

**Vérifs :**
- Tu vois l'app comme avant.
- En haut à droite, une petite pastille "Sauvegardé" apparaît brièvement quand tu coches quelque chose.
- Coche un truc, recharge la page → la coche est toujours là (sync OK).

Si la pastille montre "Erreur sync" : retour à l'étape 2, vérifie que la KV est bien connectée au projet.

---

## 5. Ajouter à l'écran d'accueil iPhone

1. Ouvre `https://elo-forme.vercel.app` dans **Safari** (pas Chrome — Chrome iOS ne sait pas installer les PWA)
2. Bouton **Partager** (carré avec flèche vers le haut, en bas)
3. Fais défiler → **"Sur l'écran d'accueil"**
4. Nom : "Elo Forme" (déjà pré-rempli)
5. **Ajouter**

L'icône (flamme dégradée rouge-orange) apparaît sur ton écran d'accueil. En tapant dessus, l'app s'ouvre en plein écran, sans la barre Safari, comme une vraie app.

**Tes données se sync automatiquement** entre ordi et iPhone via la KV. Quand tu coches sur l'iPhone, ça apparaît sur l'ordi au prochain refresh (ou quand l'onglet redevient visible).

---

## En cas de pépin

| Problème | Solution |
|---|---|
| "Erreur sync" en permanence | KV pas connectée. Storage → KV → Connect to Project → redeploy. |
| Données pas synchronisées entre appareils | Recharge la page sur l'autre appareil, ou ferme/rouvre l'app PWA. |
| Icône moche sur iPhone | Désinstalle (long press → Supprimer), recharge la page, re-ajoute à l'écran d'accueil. |
| L'URL n'est pas `elo-forme.vercel.app` | Tu peux la changer : Project Settings → Domains. |

---

## Coûts

Pour ton usage perso : **0 €**. Le free tier de Vercel KV inclut :
- 30 000 commandes/mois (largement suffisant — tu en feras peut-être 100/jour)
- 256 Mo de stockage (l'app utilise quelques Ko)

Si tu dépasses (ce qui n'arrivera pas), Vercel te prévient avant de facturer.

---

## Pour modifier l'app plus tard

Si tu veux changer un truc dans `index.html` ou `api/data.js` :
1. Modifie le fichier en local
2. Re-glisse-dépose le dossier sur Vercel (ou `npx vercel --prod` en CLI)
3. C'est en ligne en 30 secondes

Tes données dans la KV restent intactes.
