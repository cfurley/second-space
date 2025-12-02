              onSubmit={async (e) => {
                e.preventDefault();
                if (!verified) {
                  // Open the verification step so user can confirm information.
                  setMode('verify');
                  return;
                }

                const payload = {
                  title: title,
                  userId    // Remembered from somewhere in the file, i cant remember how to implement that memory. Ask AI to reference login.tsx
                };

                console.log("Attempting to create space with:", payload);

                try {
                  const data = await api.createSpace(payload);
                  console.log("Space created:", data);
                  alert(
                    `Space ${data.title} created successfully!`
                  );
                  onClose(true); // Pass true to indicate successful creation
                } catch (error) {
                  console.error("Space creation error:", error);
                  alert(
                    `Failed to create space: ${error instanceof Error ? error.message : "Unknown error"}`
                  );
                }
              }}