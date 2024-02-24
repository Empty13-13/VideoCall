const loadIndex = async(req,res) => {
  try {
    
    res.render('index')
    
  } catch(e) {
    console.log(e.message)
  }
}

module.exports = {
  loadIndex
}