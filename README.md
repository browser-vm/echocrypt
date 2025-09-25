# EchoCrypt

A visually stunning, minimalist, and secure multi-user chat application with end-to-end encryption.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/browser-vm/echocrypt)

EchoCrypt is a secure, multi-user chat application with a stunning minimalist design, built on Cloudflare's serverless infrastructure. It allows users to create private chat rooms and invite others via secure, shareable links. All messages are end-to-end encrypted on the client-side using the Web Crypto API, ensuring that the server never has access to plaintext message content. The backend, powered by Cloudflare Workers and a single Durable Object for state management, handles user authentication and stores the encrypted message data. The user interface is crafted with a focus on clarity, simplicity, and visual elegance, providing a seamless and intuitive communication experience.

## Key Features

-   **Secure Chat Rooms:** Create private, multi-user chat rooms.
-   **Invite System:** Easily invite others to your rooms with a secure, shareable link.
-   **End-to-End Encryption:** All messages are encrypted and decrypted on the client-side. The server never sees plaintext messages.
-   **Minimalist UI/UX:** A clean, beautiful, and intuitive interface designed for focus and clarity.
-   **Serverless Backend:** Powered by Cloudflare Workers for high performance and scalability.
-   **Persistent State:** Utilizes a single Cloudflare Durable Object for robust state management of users, rooms, and messages.

## Technology Stack

-   **Frontend:** React, React Router, Zustand, Tailwind CSS, shadcn/ui, Framer Motion, Lucide React
-   **Backend:** Cloudflare Workers, Hono
-   **Storage:** Cloudflare Durable Objects
-   **Build Tool:** Vite
-   **Language:** TypeScript
-   **Schema Validation:** Zod

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed on your system:

-   [Node.js](https://nodejs.org/en/) (v18 or later recommended)
-   [Bun](https://bun.sh/)
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/echocrypt.git
    cd echocrypt
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Set up local environment variables:**
    Create a `.dev.vars` file in the root of the project. This file is used by Wrangler for local development. For this project, no specific variables are required to get started, but you can add any future environment variables here.

    ```
    # .dev.vars
    # Add any environment-specific variables here
    ```

## Development

To start the local development server, which includes both the Vite frontend and the Cloudflare Worker backend, run the following command:

```bash
bun dev
```

This will start the application, and you can access it in your browser at `http://localhost:3000` (or the port specified in your terminal). The frontend will automatically reload on changes, and the worker will be updated as well.

## Usage

The application flow is designed to be simple and intuitive:

1.  **Register/Login:** A new user creates an account or logs in through the authentication page.
2.  **Create a Room:** Once logged in, the user can create a new chat room from the main chat interface.
3.  **Invite Users:** After creating a room, the user can generate a unique invite link and share it with others.
4.  **Join a Room:** Anyone with the invite link can join the room.
5.  **Chat Securely:** All members of the room can now exchange end-to-end encrypted messages.

## Deployment

This project is configured for seamless deployment to Cloudflare Pages.

1.  **Log in to Wrangler:**
    If you haven't already, authenticate Wrangler with your Cloudflare account:
    ```bash
    wrangler login
    ```

2.  **Deploy the application:**
    Run the deploy script to build the application and deploy it to your Cloudflare account:
    ```bash
    bun deploy
    ```

    Wrangler will handle the process of building the frontend assets, bundling the worker, and deploying everything to Cloudflare.

Alternatively, you can deploy directly from your GitHub repository using the button below:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/browser-vm/echocrypt)

## Project Structure

The codebase is organized into three main directories:

-   `src/`: Contains all the frontend React application code, including pages, components, hooks, and styles.
-   `worker/`: Contains the backend Cloudflare Worker code, built with Hono. This includes API routes and Durable Object entity definitions.
-   `shared/`: Contains TypeScript types and other code shared between the frontend and the backend to ensure type safety.

## Contributing

Contributions are welcome! If you have suggestions for improving the project, please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.