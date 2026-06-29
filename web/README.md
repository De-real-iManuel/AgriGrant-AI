# AgriGrant AI - Frontend Dashboard

This directory contains the Next.js React application for AgriGrant AI, serving as the interactive Human-in-the-Loop (HITL) interface for both grant applicants and internal grant specialists.

## Purpose and Context

While the UiPath RPA agents handle the complex data processing, grant matching, and automated submissions in the background, a high-stakes financial process cannot be entirely autonomous. It requires human oversight to ensure accuracy and to provide the user with agency over their data.

This frontend application provides that critical interface. It translates the highly complex JSON payloads outputted by the UiPath pipeline into an intuitive, accessible dashboard.

**The User Psychology:**
When a rural farmer or a busy grant specialist interacts with this platform, they are not interacting with "RPA" or "Automation." They are interacting with a system that promises to secure their livelihood. Therefore, the interface must abstract the technical complexity of the pipeline. It must provide absolute clarity on what is required (e.g., missing compliance documents) and provide transparent reasoning for why certain grants were recommended or rejected.

## Core Features

1. **Intelligent Onboarding:** A streamlined form that collects demographic and operational data, initiating the UiPath pipeline.
2. **Real-Time Pipeline Tracking:** Utilizing Server-Sent Events (SSE) connected to our Python backend, the dashboard visualizes the asynchronous execution of the UiPath agents in real-time, providing transparency into the automated matching process.
3. **HITL Interventions:** The application features distinct screens corresponding to UiPath suspension points:
    * **Grant Selection:** Reviewing AI-matched grants and their probability scores.
    * **Document Top-Up:** An interface to upload missing compliance documents flagged by the UiPath Document Understanding model.
    * **Proposal Review:** A specialized dashboard for grant experts to review the AI-drafted business proposal, modify the budget, and approve the final submission.
    * **Appeals Management:** An interface that parses scraped rejection data from institutional portals, allowing specialists to execute AI-recommended appeal strategies.

## Architectural Integrity

The frontend is completely decoupled from the UiPath Orchestrator infrastructure. It does not contain any Orchestrator URLs or API keys. All actions performed within this dashboard (such as approving a proposal) construct a secure payload that is transmitted to the Python backend, which then securely proxies the decision to the suspended UiPath job. Furthermore, the application enforces strict multi-tenant data isolation by utilizing unique job session identifiers.

## Technical Stack

* **Framework:** Next.js (React)
* **Styling:** Tailwind CSS (designed for high accessibility and clarity)
* **Icons:** Lucide React
* **State Management:** React Hooks and modular component architecture

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure the `.env.local` file to point to the FastAPI backend URL (e.g., `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000`).
3. Run the development server:
   ```bash
   npm run dev
   ```
