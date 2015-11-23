TaskCollection = new Mongo.Collection("tasks");


if(Meteor.isClient) {

  Template.body.helpers({
    tasks: function(){
      if(Session.get("hideCompleted")){
        return TaskCollection.find({checked: {$ne:true}}, {sort: {createdAt: -1}});  
      }
      else {
        return TaskCollection.find({}, {sort: {createdAt: -1}});
      } 
    },
    hideCompleted: function(){
      return Session.get("hideCompleted")
    },
    incompleteCount: function(){
      return TaskCollection.find({checked: {$ne: true}}).count();
    }
  });

  Template.body.events({
    "submit .new-task": function(event){

      event.preventDefault();

      // Grabs the text in the form 
      var text = event.target.text.value;
     
      // Throws that text into the database/collection, as well when it was added and by whom.
      Meteor.call("addTask", text);

      // resets the value of the textbox to an empty string
      event.target.text.value = "";
    },
    "change .hide-completed input": function(event){
      Session.set("hideCompleted", event.target.checked)
    }
  });

  Template.task.events({
    "click .toggle-checked": function(){
      Meteor.call("setChecked", this._id, !this.checked);
    },
    "click .delete": function(){
      Meteor.call("deleteTask", this._id);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  addTask: function(text){
    if(!Meteor.userId()){
      throw new Meteor.Error("not-authorized");
    }

    TaskCollection.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function(taskId){
    TaskCollection.remove(taskId);
  },
  setChecked: function(taskId, setChecked){
    TaskCollection.update(taskId, {$set: {checked:setChecked}})
  }
});