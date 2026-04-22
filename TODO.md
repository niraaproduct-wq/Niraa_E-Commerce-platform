# Separate Admin Deployment Implementation Plan

## Current Progress
- [x] Analyzed files and created detailed plan
- [ ] Create admin/ directory structure
- [ ] Move admin files to admin/
- [ ] Create admin/ config files (package.json, vite.config.js, etc.)
- [ ] Cleanup client/ customer app
- [ ] Test both apps locally
- [ ] Deploy to Vercel (separate projects)
- [ ] Update links/security

## Detailed Steps

### Phase 1: Setup admin/ structure (Next)
1. Copy client/package.json → admin/package.json
2. Copy client/vite.config.js → admin/vite.config.js  
3. Copy client/index.html → admin/index.html
4. Create admin/src/main.jsx, admin/src/App.jsx (admin-only)
5. Move `client/src/pages/admin/*` → `admin/src/pages/*`
6. Move `client/src/context/AdminContext.jsx` → `admin/src/context/AdminContext.jsx`
7. Move `client/src/components/AdminToolbar.jsx` → `admin/src/components/AdminToolbar.jsx`

### Phase 2: Configure admin app
8. Update admin/src/App.jsx: AdminProvider + AdminRoutes
9. Update admin/src/main.jsx: Admin App mount
10. Remove client/src/pages/admin/ directory
11. Delete client/src/context/AdminContext.jsx, client/src/components/AdminToolbar.jsx

### Phase 3: Cleanup customer app (client/)
12. Edit client/src/App.jsx: Remove AdminProvider/AdminToolbar
13. Edit client/src/routes/AppRoutes.jsx: Remove /admin/* route
14. Strip admin UI from client/src/pages/EnhancedHome.jsx 
15. Strip admin UI from client/src/components/EnhancedProductCard.jsx

### Phase 4: Test & Deploy
16. `cd client && npm i && npm run dev` ✅
17. `cd admin && npm i && npm run dev` ✅  
18. Vercel deploy: customer (root=client/), admin (root=admin/)
19. Update admin layout: Back to Website → customer domain
20. Add admin auth/security checks

**Commands to run after Phase 3:**
```bash
# Install deps
npm install --prefix client
npm install --prefix admin

# Test
npm run dev --prefix client    # Customer: http://localhost:5173
npm run dev --prefix admin    # Admin: http://localhost:5174
```

**Vercel Deployment:**
1. New Project → Import repo → Root Directory: `client/` → Deploy
2. New Project → Import repo → Root Directory: `admin/` → Deploy
