const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const axios = require('axios');
const express = require('express');
const { htmlToText } = require('html-to-text');
const app = express();
const cors = require('cors');
var gramophone = require("gramophone")
const puppeteer = require("puppeteer")



app.use(cors());

app.use(
  express.urlencoded({ extended: true })
);
  
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


const func = async(url) => {
  let fetchedData = []
  const res = await axios(url)
  const html = await res.data
  // console.log('html: ', html)
      const text = htmlToText(html,{
        wordwrap: 130,
      });
      // console.log('text: ', text)
      // const extraction_result = keyword_extractor.extract(text,{
      //   language:"english",
      //   remove_digits: true,
      //   return_changed_case:true,
      //   remove_duplicates: true,
      //   ignoreHref : true,
      //   linkBrackets: false,
      //   remove_brackets: true
      // });
      // extraction_result.sort();
      
      // console.log(extraction_result);
      // for (let i = 0; i < extraction_result.length; i++) {
      //   if(extraction_result[i].length > 5 && extraction_result[i].match(/^[a-zA-Z]+$/)){
      //     console.log(extraction_result[i]);
      //   }
      // }    

  const final = gramophone.extract(text, {min:5}, {stem: true}, {unique: true});
      // console.log(final)
      for (let i = 0; i < final.length; i++) {
        if(final[i].length > 5 && final[i].match(/^[a-zA-Z]+$/)){
          console.log(final[i]);
          fetchedData.push(final[i])
        }
      }
      

  return fetchedData;
}

async function start(url) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const data = await func(url);
  let result =[]
  // console.log('func')
  for(let item of data){
    console.log("Result for: ", item)
    let subResult = []
    await page.goto(`https://www.google.com/search?q=good+movies+to+watch+about+movies+about${item}&gl=in&hl=en`)
    
    const names = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".oZ5mO")).map(x => x.textContent)
    })
    const photos = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".w3hBsd img")).map(x => x.src)
    })
  
    const google = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".oZ5mO")).map(x => x.href)
    })
  
    const trailer = await page.evaluate(() => {
      return Array.from(document.getElementsByClassName("r7kjf")).map((x, index) => {
        return document.getElementsByClassName("r7kjf")[index].attributes['data-trlr'].nodeValue
      })
    })

    const rate = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".yY6zId")).map(x => x.textContent)
    })
  
    const duration = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".i5JHkf.ellip > div:nth-child(2)")).map(x => x.textContent)
    })
  
    const year = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".i5JHkf.ellip > div:nth-child(4)")).map(x => x.textContent)
    })
  
    const stream = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".i5JHkf.ellip > div:nth-child(6)")).map(x => x.textContent)
    })

    subResult = names.map((name, index) => {
      return {
        name: names[index],
        photo: photos[index],
        google: google[index],
        trailer: trailer[index],
        rate: rate[index],
        duration: duration[index],
        year: year[index],
        stream: stream[index]
      }
    })
    // console.log('subResult: ', subResult)
    result.push(subResult)
  }
  await browser.close()

  return result
}
// Home route
app.get("/", (req, res) => {
  res.send("Welcome to a basic express App");
});

app.post('/results', async (req, res) => {

const {text} = req.body
console.log(text)
const result = await start(text)
console.log(result)
res.json(result)
})


const port  = process.env.PORT || 8000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
