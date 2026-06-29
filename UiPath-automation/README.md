# The UiPath Brain: Automation & AI Agents

This directory contains the core robotic process automation (RPA) workflows and specialized AI agents that power the AgriGrant AI ecosystem. 

## Purpose and Context

While the FastAPI backend routes data and the Next.js frontend interacts with humans, this directory houses the true "Brain" of the project. We utilize a **5-Stage Pipeline** deployed via UiPath Orchestrator and UiPath Studio to completely automate the highly bureaucratic, document-heavy agricultural grant process.

For a Nigerian smallholder farmer, the grant process is typically a labyrinth of compliance checks, dense policy documents, and digital portals they cannot access. Our UiPath agents act as a tireless, highly intelligent proxy that navigates this labyrinth on their behalf.

## The 5-Stage Automation Architecture

We have modularized our automation into distinct, highly specialized agents. This allows for scalability, easier debugging, and the ability to inject Human-in-the-Loop (HITL) checkpoints seamlessly.

### Stage 1: Discover & Match
* **`Grant Discovery & Matching Agent/`**: 
  * **Role:** Parses the farmer's demographic and operational data.
  * **Action:** Uses Natural Language Understanding (NLU) to cross-reference the farmer's profile against thousands of active federal, state, and international grants (e.g., ACRESAL, IFAD). It outputs a probabilistic match score (e.g., 92% Match).

### Stage 2: Trust Vault (Document Understanding)
* **`Document Understanding Agent/`** & **`Eligibility & Risk Assessment Agent/`**:
  * **Role:** Establishes compliance and trust.
  * **Action:** Ingests raw uploads (NIN IDs, CAC certificates, scanned Bank Statements). It extracts key entities, validates their authenticity against grant criteria, and calculates a dynamic "Trust Score." If a document is missing or invalid, it triggers a request back to the farmer.

### Stage 3: Proposal Draft
* **`Proposal Generation Agent/`**:
  * **Role:** Translates raw data into formal, institutional-grade business proposals.
  * **Action:** Utilizes Large Language Models (LLMs) to construct highly structured narratives. It synthesizes a compelling project description, justifies the budget breakdown, and automatically structures the requested annexures.

### Stage 4: Human Review (BPMN HITL)
* **`Nigerian AgriGrant Pipeline/`**:
  * **Role:** The overarching Orchestrator State Machine.
  * **Action:** This is not a standalone agent, but the master workflow. After Stage 3, this workflow deliberately *suspends execution*. It packages the drafted proposal and fires a secure webhook to the FastAPI backend, routing the case to a Human Specialist on the React Dashboard. It waits asynchronously until a human clicks "Approve," "Request Revisions," or "Reject."

### Stage 5: Submit & Track
* **`Submission & Follow-up Agent/`** & **`Grant Form Filler Robot/`**:
  * **Role:** The executioners.
  * **Action:** Once human approval is received, these headless RPA bots navigate the complex, often poorly-designed institutional funding portals. They automatically fill out web forms, upload the validated PDFs, submit the final application, and routinely scrape the portal to track status updates (Under Review, Shortlisted, Awarded).

## Deployment Instructions

1. Open `Nigerian AgriGrant Pipeline` as the main project in UiPath Studio.
2. Ensure you have the **UiPath.DocumentUnderstanding.Activities** and **UiPath.WebAPI.Activities** packages installed.
3. Configure your Orchestrator tenant to handle the suspended/resumed webhook callbacks.
4. Publish the package to Orchestrator and run the main entry point.
