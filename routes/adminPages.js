var express = require('express');
var router = express.Router();
var Page = require('../models/pages');

module.exports = router;

//GET page index
router.get('/', (req, res) => {
  Page.find({}).sort({
    sorting: 1
  }).exec((err, pages) => {
    res.render('admin/pages', {
      pages: pages
    });
  });
});

//GET add page
router.get('/add-page', (req, res) => {
  var title = "";
  var slug = "";
  var content = "";

  res.render('admin/add_page', {
    title: title,
    slug: slug,
    content: content
  });
});

//POST add page

//GET add page
router.post('/add-page', (req, res) => {
  req.checkBody('title', 'Title must not be empty').notEmpty();
  req.checkBody('content', 'Content must not be empty').notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  if (slug == "") slug = req.body.title.replace(/\s+/g, '-').toLowerCase();
  var content = req.body.content;

  var errors = req.validationErrors();

  if (errors) {
    res.render('admin/add_page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content
    });
  } else {
    Page.findOne({
      slug: slug
    }, (err, page) => {
      if (page) {
        req.flash('danger', 'Page slug exists, please chose another');
        res.render('admin/add_page', {
          title: title,
          slug: slug,
          content: content
        });
      } else {
        var page = new Page({
          title: title,
          slug: slug,
          content: content,
          sorting: 100
        });
        page.save(err => {
          if (err) {
            console.log(err);
          } else {
            req.flash('success', 'Page added');
            res.redirect('/admin/pages');
          }
        });
      }
    });
  }

});

router.post('/reorder-pages', (req, res) => {
  var ids = req.body['id'];
  var count = 0;

  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;
    (function (count) {
      Page.findById(id, (err, page) => {
        page.sorting = count;
        page.save(err => {
          if (err) {
            return console.log(err);
          }
        });
      });
    })(count);

  }
});

//GET edit page
router.get('/edit-page/:slug', (req, res) => {
  Page.findOne({
    slug: req.params.slug
  }, (err, page) => {
    if (err) {
      console.log(err);
    }else{
    res.render('admin/edit_page', {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id
    });}
  });
});

//POST edit page
router.post('/edit-page/:slug',(req,res)=>{
  req.checkBody('title','Title must not be empty').notEmpty();
  req.checkBody('content','Content must not be empty').notEmpty();
  
  var title=req.body.title;
  var slug=req.body.slug.replace(/\s+/g,'-').toLowerCase();
  if(slug=="")
    slug=req.body.title.replace(/\s+/g,'-').toLowerCase();
  var content=req.body.content;
  var id=req.body.id;

  var errors=req.validationErrors();

  if(errors){
    res.render('admin/edit_page',{
      errors:errors,
      title:title,
      slug:slug,
      content:content,
      id:id
    });
  }else{
    Page.findOne({slug:slug,
    _id:{'$ne':id}},(err,page)=>{
      if(page){
        req.flash('danger','Page slug exists, please chose another');
        res.render('admin/edit_page',{
          title:title,
          slug:slug,
          content:content,
          id:id
        });
      }
      else{
        Page.findById(id,(err,page)=>{
          if(err){
            console.log(err);
          }
          else{
            page.title=title;
            page.content=content;
            page.slug=slug;
            
            page.save((err)=>{
              if(err){
                console.log(err);
              }
              else{
                req.flash('success','Page edited successfully');
                res.redirect('/admin/pages/edit-page/'+page.slug);
              }
            });
          }
        });
      }
    });
  }
});

//GET delete page

router.get('/delete-page/:id', (req, res) => {
  Page.findByIdAndRemove(req.params.id,(err)=>{
    if(err){
      return console.log(err);
    }
    else{
      req.flash('success','Page deleted successfully');
      res.redirect('/admin/pages/');
    }
  });
});
