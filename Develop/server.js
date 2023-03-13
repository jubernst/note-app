const express = require("express");
const fs = require("fs");
const path = require("path");
const noteData = require("./db/db.json");
var uniqid = require("uniqid");

const app = express();
const PORT = process.env.PORT || 3001;

// TODO: Invoke app.use() and serve static files from the '/public' folder
app.use(express.static("./public"));

// Sets up the Express app to handle data parsing and urlencoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public/index.html"))
);

app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "public/notes.html"))
);

// GET request for notes
app.get("/api/notes", (req, res) => {
  // Send the notes to the client in json
  res.status(200).json(noteData);

  // Log our GET request to the terminal
  console.info(`${req.method} request received to get notes`);
});

// POST request to add a new note
app.post("/api/notes", (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to add a note`);

  // Deconstruct the request
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Save the new note with a unique id
    const newNote = {
      title,
      text,
      id: uniqid(),
    };
    // Add the new note to the json file
    fs.readFile("./db/db.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // Convert notes string into json object
        const parsedNotes = JSON.parse(data);

        // Add the new note
        parsedNotes.push(newNote);

        // Rewrite the file with the new note
        fs.writeFile(
          "./db/db.json",
          JSON.stringify(parsedNotes, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info("Successfully updated notes")
        );
        // Then the new note needs to be rendered in the sidebar. This should be on the
        // client side? but it's not happening
        // i am saving the notes to the json file properly and everything
      }
    });

    // Prepare a response to send to the client
    const response = {
      status: "success",
      data: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(400).json("Error in posting note");
  }
});

// DELETE request to delete a note from a given id
app.delete("/api/notes/:id", (req, res) => {
  // Log that a DEL request was received
  console.info(`${req.method} request received to delete a note`);

  const requestedId = req.params.id;

  // Iterate through the note ids to check if it matches `req.params.id`
  if (requestedId) {
    for (let i = 0; i < noteData.length; i++) {
      if (requestedId === noteData[i].id) {
        fs.readFile("./db/db.json", "utf8", (err, data) => {
          if (err) {
            console.error(err);
          } else {
            // Convert string into a JSON object
            const parsedNotes = JSON.parse(data);

            // Splice the review out of the array
            parsedNotes.splice(i, 1);

            // Write updated notes back to the file
            fs.writeFile(
              "./db/reviews.json",
              JSON.stringify(parsedNotes, null, 4),
              (writeErr) =>
                writeErr
                  ? console.error(writeErr)
                  : console.info("Successfully deleted the note!")
            );
          }
        });
        return res.json(noteData[i]);
      }
    }
  }

  // Return a message if the id doesn't exist in our DB
  return res.json("ID not found");
});

app.listen(PORT, () =>
  console.log(`Example app listening at http://localhost:${PORT}`)
);
