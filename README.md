# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/7e739d4d-9a69-4c24-a53d-662f2d59d008

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7e739d4d-9a69-4c24-a53d-662f2d59d008) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

## Development Server Information

The frontend development server uses Vite and runs on port 5173 by default. However, if that port is already in use, Vite will automatically switch to the next available port (typically 5174). This is normal behavior and not an error.

When starting the development server with `npm run dev`, always check the terminal output for the correct URL. It will display something like:

```
Local: http://localhost:5174
```

This indicates which port the server is actually running on. Simply open that URL in your browser to view the application.

To force the server to always use port 5173 (and exit if it's busy), you can modify the `vite.config.ts` file to set `strictPort: true`.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## API Integration

This frontend application integrates with a Django backend API. All data fetching and mutations are handled through React Query for efficient caching and state management.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_BASE_URL=http://localhost:8000
```

### API Services

The application uses the following API services:
- Authentication (registration, login, refresh, logout)
- Schemes (list, details, categories, search)
- Complaints (create, list, details, update, heatmap)
- Discussions (list, create, add comment)
- Documents (list, upload, delete)
- Regions (list)
- Sentiment (analysis)
- Chat (messages, send)
- Admin (users, stats)

## Testing

### Running the Application

1. Ensure the backend Django server is running on `http://localhost:8000`
2. Install frontend dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open the application in your browser (typically at `http://localhost:5173` or `http://localhost:5174`)

### Testing User Flows

1. **Registration & Login**
   - Navigate to `/signup` to create a new account
   - After registration, proceed to `/login` to authenticate
   - Verify that you are redirected to the home page after successful login

2. **Scheme Browsing**
   - Navigate to `/schemes` to view all government schemes
   - Use the search and filter functionality to find specific schemes
   - Click on any scheme to view detailed information

3. **Complaint Submission**
   - Navigate to `/complaints` to view existing complaints
   - Click "New Complaint" to create a new complaint
   - Fill in the complaint details and submit
   - Verify that the new complaint appears in the complaints list

4. **Discussion Participation**
   - Navigate to `/discussions` to view all discussions
   - Create a new discussion topic
   - Add comments to existing discussions

5. **Document Management**
   - Navigate to `/documents` to view uploaded documents
   - Upload a new document and verify it appears in the list
   - Delete a document and verify it is removed from the list

6. **Admin Functionality**
   - Log in as an admin user
   - Navigate to `/admin` to view admin panel
   - Verify user management and statistics display

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7e739d4d-9a69-4c24-a53d-662f2d59d008) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
