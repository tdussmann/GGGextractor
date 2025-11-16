# GGG Extractor AI - Google Cloud Function

This directory contains a self-contained Google Cloud Function that serves both the frontend React application and the backend API for extracting grid data from images using the Gemini API.

## Prerequisites

Before deploying, ensure you have the following:

1.  **Google Cloud SDK (`gcloud`)**: [Install and initialize the gcloud CLI](https://cloud.google.com/sdk/docs/install).
2.  **A Google Cloud Project**: Create a new project or use an existing one. Make sure billing is enabled.
3.  **Enabled APIs**: Enable the Cloud Functions API and the Cloud Build API for your project. You can do this with the following commands:
    ```bash
    gcloud services enable cloudfunctions.googleapis.com
    gcloud services enable cloudbuild.googleapis.com
    ```
4.  **Gemini API Key**: Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Deployment Instructions

Follow these steps to deploy the function using the `gcloud` CLI.

1.  **Navigate to this directory**:
    Open your terminal and change into the `functions` directory of this project.

    ```bash
    cd path/to/your/project/functions
    ```

2.  **Set your Gemini API Key**:
    You will need to replace `YOUR_GEMINI_API_KEY` in the command below with the actual key you obtained from Google AI Studio.

3.  **Deploy the Function**:
    Run the following command. This command deploys the function to the `europe-west3` region, sets the Node.js 22 runtime, and allows public access so you can use the web app.

    ```bash
    gcloud functions deploy extractGrid \
      --runtime nodejs22 \
      --trigger-http \
      --entry-point extractGrid \
      --region europe-west3 \
      --allow-unauthenticated \
      --set-env-vars API_KEY=YOUR_GEMINI_API_KEY
    ```

    Deployment might take a few minutes.

## Accessing the Application

Once the deployment is complete, the `gcloud` CLI will output the trigger URL (e.g., `https://europe-west3-your-project-id.cloudfunctions.net/extractGrid`).

Visit this URL in your web browser to use the GGG Extractor AI application.