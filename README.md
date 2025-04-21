# AI-JobHunt 🎯

AI-JobHunt is a modern React-based web application designed to help users explore job listings, check their eligibility, upload applications, and visualize job market trends — all with a clean and interactive UI.

---

## 🚀 Features

### 🔐 Authentication
- **Login Page**: Secure login form with form validation.
- **Register Page**: Sign up form with user feedback and validation.

### 🏠 Dashboard Pages
- **Home Page**: A landing page with a welcome message and links to navigate across the platform.
- **Job Trends**: Interactive charts showing market/job trends (e.g., most in-demand roles or companies).
- **Job Listings**: Browse all jobs with title, company, and "Apply" buttons.
- **Eligibility Checker**: Users can input their skills, experience, and preferences to find suitable jobs.
- **Apply Page**: 
  - Upload **Resume** and **Cover Letter** files.
  - Submit form to display a success message:  
    `"Your application is submitted. Thanks for your interest!"`
  - Includes a **Home button** to return to the homepage.

---

## 📁 Project Structure

```
AI-JobHunt/
├── backend/
│   ├── .eiv
│   ├── ai_ml jobs _linkedin.xlsx
│   ├── data loader.py
│   ├── database.py
│   ├── import_excel.py
│   ├── main.py
│   ├── models.py
│   ├── requirements. txt
│   ├── routes.py
│   ├── test,py
│   ├── utils. py            
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── JobTrends.jsx
│   │   │   ├── Jobs/
│   │   │   │   ├── JobListings.jsx
│   │   │   │   └── Apply.jsx
│   │   │   ├── Eligibility/
│   │   │   │   └── EligibilityForm.jsx
│   │   ├── App.jsx
│   │   ├── index.js
│   ├── package.json
├── README.md
```

---

## 🌐 Deployment

### Using Vercel (Frontend Deployment)

1. **Connect GitHub Repo to Vercel**  
   Login to [Vercel](https://vercel.com) and import your GitHub project.

2. **Set Root Directory to `frontend/`**
   If not prompted during setup, go to:
   - Project ➜ Settings ➜ Build & Development Settings ➜ Root Directory ➜ Set to `frontend`

3. **Build and Output Settings**
   ```
   Build Command: npm run build
   Output Directory: build
   ```

4. **Automatic Deploys**  
   Vercel redeploys your site on every push to the `main` branch.

---

## ⚙️ Development Setup

### Prerequisites

- Node.js
- npm or yarn

### Running Locally

```bash
cd frontend
npm install
npm start
```

### Build for Production

```bash
npm run build
```

---

## 💡 To Do / Enhancements

- Add user authentication backend (if not already done)
- Implement role-based access (Admin vs Applicant)
- Job recommendation system using ML models
- User profile & application history page

---

## 🤝 Contributing

Open to contributions! Feel free to fork, create a branch, and raise a PR.

---

## 📄 License

MIT License