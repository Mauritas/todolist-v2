const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://Mauritas:mauro123@cluster0.hvtq8ni.mongodb.net/todolistDB');

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const todo1 = new Item({
  name: "Welcome to your to do list!"
});
const todo2 = new Item({
  name: "Hit the + button to add a new item."
});
const todo3 = new Item({
  name: "<-- Hit this to delete a item."
});
const todo4 = new Item({
  name: "Type / in the address bar to create a customized list"
});

const defaultItems = [todo1, todo2, todo3, todo4];

const listSchema= new mongoose.Schema({
  name:String,
  item: [itemsSchema]
});

const List= mongoose.model("List", listSchema);



app.get("/", function(req, res) {
  Item.find()
    .then(function(items) {
      if (items.length === 0) {
        Item.insertMany(defaultItems)
          .then(function() {
            console.log("Success!");
          })
          .catch(function(err) {
            console.log(err);
          });
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: items
        });
      }
    })
    .catch(function(err) {
      console.log(err);
    });
});
app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName= req.body.list;

  const addNewToDo= new Item({
    name:itemName
  });

  if(listName==="Today"){
    addNewToDo.save();

    res.redirect("/");
  } else{
    List.findOne({name:listName})
    .then(function(foundList){
      foundList.item.push(addNewToDo);
      foundList.save();
      res.redirect("/" + listName);
    }).catch(function(err){console.log(err);});

  }


});
app.post("/delete",function(req,res){
  const checkedIdDelete = req.body.checkbox;
  const listNameDelete= req.body.listName;
  if(listNameDelete==="Today"){
    Item.findByIdAndRemove(checkedIdDelete)
    .then(function(){
      console.log("Deleted Succesfully!");
      res.redirect("/");
    })
    .catch(function(err){
      console.log(err);
    });
  }else {
    List.findOneAndUpdate({name: listNameDelete},{$pull:{item:{_id: checkedIdDelete}}})
    .then(function(){
      res.redirect("/" + listNameDelete);
    }).catch(function(err){console.log(err);});
  }

});

app.get("/:title",function(req,res){
  const newTitle= _.capitalize(req.params.title);

  List.findOne({name:newTitle})
  .then(function(foundList){
    if(!foundList){
        //Create a new List!
        setTimeout(function(){
          const list= new List({
            name: newTitle,
            item:defaultItems
          });
          list.save();
          res.redirect("/" + newTitle)
        },500);
    }else{
      //Show an existing list!

      res.render("list", {listTitle:foundList.name, newListItems: foundList.item});
    }



  })
  .catch(function(err){
    console.log(err);
  });






});
app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

// <div class="box">
//   <% for (let i=0; i<newListItems.length; i++) { %>
//     <div class="item">
//       <input type="checkbox">
//       <p><%=  newListItems[i].name  %></p>
//     </div>
//     <% } %>
