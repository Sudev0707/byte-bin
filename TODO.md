# Fix 401 Unauthorized on /api/problems/add

## Progress:
✅ 1. Confirmed bytebin-client/.env exists (.env and .env.example present)

## Progress:
✅ 1. Confirmed .env exists
✅ 2. Updated AddProblem.tsx to use axiosInstance + /problems/add
✅ 3. Added clerkId to AddProblems.js schema
✅ 4. Updated problemRoutes.js POST to save clerkId

## Remaining:
5. [ ] Test: Frontend dev server + backend, sign in, submit form (check Network tab for 201)
6. [ ] Restart backend (`cd backend && npm start` or nodemon)
7. [ ] Update Render deployment
8. [ ] Complete
