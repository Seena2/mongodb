const express = require("express");
const { connectToDb, getDb } = require("./db");
const { ObjectId } = require("mongodb");

//Initialize the app and middleware
//incoke the imported express to start the application
const app = express();
app.use(express.json());

//db Connection
let db; //object to holds the establesh connction object to retun for usage/interactions
connectToDb((err) => {
  //if the connection succed start listening for requests and
  // make available db connection object, else show error
  if (!err) {
    //listen on port 3000 for requests
    app.listen(3000, () => {
      console.log("Listining on port 3000...");
    });
    db = getDb();
  }
});

//Routes
//Get request handlers
app.get("/books", (req, res) => {
  //pagination
  // returns the value  being requested (when p stands for page) and
  // if the value of p is not specied as parameter on the request,
  // we set it to be "0" as a default value which starts at the begging of the page
  const page = req.query.p || 0;
  //decide how many pages per page to send back
  const booksPerPage = 3;

  let books = []; //set up array to store the books
  db.collection("books") //reference books collection in the Bookstore DB
    .find() //find all the books in the collection,retuns cursor
    .sort({ author: 1 }) //sort the books by author name
    //skipt to the page number specified by parameter in the request
    .skip(page * booksPerPage)
    .limit(booksPerPage) // limit/specify the number of documents to display per page
    /*apply one of the cursor method(forEach) to the result of soring and 
      //when the method completes fetchng and pushing each book to the empty "books" array created at the begging,
      // we will have all the books stored in "books" array variable we created above. */
    .forEach((book) => {
      //push individual book into the "books" array
      books.push(book);
    })
    //hence the forEach is async method witch takes time,we attach "then"(a promise) to it,
    // which excute when the task of fething batches documents is completed
    //and then send response as JSON to user that make a request
    .then(() => {
      res.status(200).json(books);
    })
    //then catch error if there is any,send diferent response Json object error
    .catch(() => {
      res.status(500).json({ error: "Could not fetch the documents" });
    });
});

//getting single Document by its id via get request handler
app.get("/books/:id", (req, res) => {
  //grab the route parameter passed as arguiument to the get request handler from request object(//req.params.id)
  //Check if the id string passed is valid
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books") //target collection
      //locate the document passed as arguement to get request via findOne method of mongoDB
      //by passing its id, which can be obtained from request object of the get request handler
      .findOne({ _id: new ObjectId(req.params.id) })
      .then((doc) => {
        //send the target doc as a response via the then() of the promise
        res.status(200).json(doc);
      })
      .catch((err) => {
        res.status(500).json({ err: "Could not fetch the document" });
      });
  } else {
    res.status(500).json({ error: "Not valid Document Id" });
  }
});

//Post Request to books collection
app.post("/books", (req, res) => {
  //get body of the post request which contains all the information we want to save to the DB
  //in this case what will be the book document
  //Note first use the middleware to get body of request, //app.use(express.json());....line(8)

  const book = req.body; //book object
  //save the obtained book object to the DB
  db.collection("books") //grab the target collection
    .insertOne(book) // async function that inserts the book object
    // a promise which resives result from DB and send json response to user when the above aync fun(insertOne) completes
    .then((result) => {
      //201 means successfuly added resources
      res.status(201).json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: "Could not create new document" });
    });
});

//Delete request handler//Removing data by its id //same to findOne() except here we delete the document
//pass the Id to the handler
app.delete("/books/:id", (req, res) => {
  //check if the id is valid object ID
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books") //get books collection
      // delete the document using id property and with specified id from route parameter
      .deleteOne({ _id: new ObjectId(req.params.id) })
      //send the result of the operation as a response when the deleteOne() complete  via the then() of the promise
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ err: "Could not delete the document" });
      });
  } else {
    res.status(500).json({ error: "Not valid Document Id" });
  }
});

//patch request , for updating exisitng data in the DB
app.patch("/books/:id", (req, res) => {
  //grab the body of the request
  const updates = req.body; //Object containing all the fields to be updated and which come through the request body
  //check if the id is valid object ID
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books") //get books collection
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates }) //note updates is object, so we dont need to specify each field inside brackets
      //send the result of the operation as a response when the deleteOne() complete  via the then() of the promise
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ err: "Could not update the document" });
      });
  } else {
    res.status(500).json({ error: "Not valid Document Id" });
  }
});
