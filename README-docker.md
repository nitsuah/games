# Arcade Docker Run Instructions

To run the arcade app in a Docker container on a cluster with many agents:

1. Build the Docker image from the repository root and tag it as `games`:
   - `docker build -t games .`
2. Use the provided `arcade-docker-run.sh` script to automatically find an available port, run the container, and log the port for coordination.
3. The script will use the local `games` image and:
   - Search for an available port (starting at 3000)
   - Start the container with `-p <host_port>:3000` and `--env PORT=3000`
   - **Overwrite** `.arcade-ports` with the current port on each run (the file always reflects the last run only)
4. To stop a running container:
   - `docker ps` to find the container name (e.g., arcade-3001)
   - `docker stop <container_name>`
   - `docker rm <container_name>`

**Best Practices:**
- `.arcade-ports` is a runtime artifact — it is listed in `.gitignore` and should not be committed to source control.
- The script overwrites `.arcade-ports` on each run; it does not accumulate stale entries.
- When a container is stopped, manually remove or clear `.arcade-ports` if you want to avoid stale references.
- If you need a specific port, you can run:
  `docker run -d -p 3002:3000 --env PORT=3000 --name arcade-3002 games`

**Note:** The app inside the container always listens on port 3000, but you can map any available host port to it.
