$(document).ready(function () {
  let year;
  let month;
  let selectedTopic;
  let wordList;
  let locationList;
  let filter = {};
  filter['gender'] = '';
  filter['keyword'] = [];
  filter['sentiment'] = ['0', '100'];
  filter['location'] = [];

  let submit = 0;
  let globalData;
  let filteredData;

  const provinceToCode = {
    安徽: 'CN-34',
    北京: 'CN-11',
    重庆: 'CN-50',
    福建: 'CN-35',
    广东: 'CN-44',
    甘肃: 'CN-62',
    广西: 'CN-45',
    贵州: 'CN-52',
    海南: 'CN-46',
    河北: 'CN-13',
    河南: 'CN-41',
    香港: 'CN-91',
    黑龙江: 'CN-23',
    湖南: 'CN-43',
    湖北: 'CN-42',
    吉林: 'CN-22',
    江苏: 'CN-32',
    江西: 'CN-36',
    辽宁: 'CN-21',
    澳门: 'CN-92',
    内蒙古: 'CN-15',
    宁夏: 'CN-64',
    青海: 'CN-63',
    陕西: 'CN-61',
    四川: 'CN-51',
    山东: 'CN-37',
    上海: 'CN-31',
    山西: 'CN-14',
    天津: 'CN-12',
    台湾: 'CN-71',
    新疆: 'CN-65',
    西藏: 'CN-54',
    云南: 'CN-53',
    浙江: 'CN-33',
    其他: 'other',
    海外: 'oversea',
  };

  // Update topic list
  gen_btn();
  function gen_btn() {
    for (let year = 2017; year <= 2023; year++) {
      // Add more years as needed
      $(
        '<button type="button" class="px-1 py-0 m-0 btn btn-secondary yearBtn" style="font-size: 14px;border-bottom-left-radius: 0; border-bottom-right-radius: 0" data-value="' +
          year +
          '">' +
          year +
          '</button>'
      ).appendTo('#year-btn-group');
    }

    for (let month = 1; month <= 12; month++) {
      // Add more months as needed
      $(
        '<button type="button" class="px-1 py-0 m-0 btn btn-secondary monthBtn" style="font-size: 14px;border-top-left-radius: 0; border-top-right-radius: 0" data-value="' +
          month +
          '">' +
          month +
          '</button>'
      ).appendTo('#month-btn-group');
    }

    $('.yearBtn, .monthBtn').click(function () {
      if (this.classList.contains('selected')) {
        $(this)
          .removeClass('btn-primary selected')
          .addClass('btn-secondary')
          .siblings()
          .removeClass('btn-primary selected')
          .addClass('btn-secondary');
      } else {
        $(this)
          .removeClass('btn-secondary')
          .addClass('selected btn-primary')
          .siblings()
          .removeClass('btn-primary selected')
          .addClass('btn-secondary');
      }

      //console.log('The selected year is', $('.yearBtn.selected').data('value'));
      //console.log('The selected month is', $('.monthBtn.selected').data('value'));
    });
  }

  refreshCollectionList();

  $('#submitBtn').on('click', (e) => {
    submit = 1;
    e.preventDefault(); // Prevent the default form submission

    year = $('.yearBtn.selected').data('value');
    month = $('.monthBtn.selected').data('value');
    if (!selectedTopic) {
      //console.log('no topic is selected');
      return false;
    }
    // Call your function or perform actions based on the selected topic
    console.time('Download from MongoDB');
    getTopicData(selectedTopic, year, month)
      .then(function (data) {
        console.timeEnd('Download from MongoDB');
        globalData = data;
        //console.log('Data:', data);
        refreshCollectionList(selectedTopic);
        var dashboard = $('.dashboard');
        dashboard.show();
        drawDashboard(selectedTopic, year, month, data);
        updatefilter();

        // Add event listeners to the start_date and end_date inputs
      })
      .catch(function (error) {
        console.error('Error:', error);
      });
  });

  $('#select_gender .btn').on('click', function () {
    if ($(this).hasClass('active')) {
      // If the clicked button is already active, remove the 'active' class from all buttons
      $('#select_gender .btn').removeClass('active btn-primary btn-danger').addClass('btn-secondary');
      //console.log('Selection canceled');
      filter['gender'] = '';
    } else {
      // If the clicked button is not active, make it active and remove 'active' from its siblings
      $(this).siblings().removeClass('active btn-primary btn-danger');
      $(this).siblings().addClass('btn-secondary');

      $(this).removeClass('btn-secondary').addClass('active');
      if ($(this).text() === 'Male') {
        $(this).addClass('btn-primary');
      } else if ($(this).text() === 'Female') {
        $(this).addClass('btn-danger');
      }
      // Apply the appropriate class based on the selected gender
      filter['gender'] = $(this).text()[0].toLowerCase();
      updatefilter();
    }
    updatefilter();
  });

  $('#select_word').change(function () {
    const word = $(this).val()[0];

    if (filter['keyword'].includes(word)) {
      const index = filter['keyword'].indexOf(word);
      if (index > -1) {
        filter['keyword'].splice(index, 1);
      }
    } else {
      filter['keyword'].push(word);
    }
    $(this).blur();

    updatefilter();
  });

  $('#clear_keyword_filter').click(function () {
    filter['keyword'] = [];
    updatefilter();
  });

  $('#select_location').change(function () {
    const location = $(this).val()[0];

    if (filter['location'].includes(location)) {
      const index = filter['location'].indexOf(location);
      if (index > -1) {
        filter['location'].splice(index, 1);
      }
    } else {
      filter['location'].push(location);
    }
    $(this).blur();
    updatefilter();
  });

  $('#clear_location_filter').click(function () {
    filter['location'] = [];
    updatefilter();
  });

  $('#reset_filter').click(function () {
    filter['gender'] = '';
    filter['keyword'] = [];
    filter['sentiment'] = ['0', '100'];
    filter['location'] = [];
    updatefilter();
  });

  $('#filter_on_off').click(function () {
    if ($(this).text() == 'ON') {
      $('#filter_on_off').text('OFF').removeClass('btn-success').addClass('btn-danger');
      drawDashboard(selectedTopic, year, month, globalData);
    } else {
      $('#filter_on_off').text('ON').removeClass('btn-danger').addClass('btn-success');
      drawDashboard(selectedTopic, year, month, filteredData);
    }
  });

  $('#select_sentiment').change(function () {
    // Initialize filter['sentiment'] with default values
    $('#sentiment_min').val(
      $('#sentiment_min').val() < 0 || !$('#sentiment_min').val() ? 0 : $('#sentiment_min').val()
    );
    $('#sentiment_min').val($('#sentiment_min').val() > 100 ? 100 : $('#sentiment_min').val());
    $('#sentiment_max').val(
      $('#sentiment_max').val() < 0 || !$('#sentiment_max').val() ? 0 : $('#sentiment_max').val()
    );
    $('#sentiment_max').val($('#sentiment_max').val() > 100 ? 100 : $('#sentiment_max').val());

    if (Number($('#sentiment_max').val()) <= Number($('#sentiment_min').val())) {
      //console.log($('#sentiment_max').val(), $('#sentiment_min').val());
      alert('The maximum value must be larger than minimum value');
      $('#sentiment_min').val(filter['sentiment'][0]);
      $('#sentiment_max').val(filter['sentiment'][1]);
      return;
    }

    // Then, update the values based on user input
    filter['sentiment'] = [$('#sentiment_min').val(), $('#sentiment_max').val()];

    updatefilter();
  });

  //Refresh dashboard after clicking
  $('#topicSelect').change(function () {
    selectedTopic = $(this).val();
    //console.log('Selected Topic:', selectedTopic);
  });

  //refreseh the list
  function refreshCollectionList(selectedTopic) {
    fetch('/db/collectionslist')
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data) => {
        const topicSelect = $('#topicSelect');
        topicSelect.empty();

        // Handle the successful response
        if (data.length === 0) {
          topicSelect.append($('<option disabled>').text('No Topic Available'));
        } else {
          let defaultOption = $('<option disabled>').text('Select a Topic');

          data.map((item, index) => {
            if (item != 'lda_json') {
              const option = $('<option>').text(item);

              // If the current item is the selected topic, mark it as selected
              if (item === selectedTopic) {
                option.attr('selected', 'selected');
              }
              topicSelect.append(option);
            }
          });

          // If no topic is selected, preselect the "Select a Topic" option
          if (!selectedTopic) {
            defaultOption.attr('selected', 'selected');
          }
          topicSelect.prepend(defaultOption);
        }
        $('.containerbox').show();
      })
      .catch((error) => console.error('There has been a problem with your fetch operation:', error));
  }

  //fetch data from mongodb
  function getTopicData(topic, year, month) {
    //set the list to loading
    function loadingList(word) {
      var topicSelect = $('#topicSelect');
      topicSelect.empty();
      topicSelect.append($('<option disabled selected>').text(word));
    }
    loadingList('Data Downloading');
    var dashboard = $('.dashboard');
    dashboard.hide();
    $('#warp').hide();

    return new Promise(function (resolve, reject) {
      fetch(`/db/topicdata/${topic}/${year}/${month}`)
        .then((response) => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then((data) => {
          if (data.status === 'success') {
            // Resolve the Promise with the data
            loadingList('Data processing');
            resolve(data.data);
          } else {
            // Reject the Promise with the error message
            reject(data.message);
          }
        })
        .catch((error) => console.error('There has been a problem with your fetch operation:', error));
    });
  }

  function updatefilter() {
    if (JSON.stringify(filter) === '{"gender":"","keyword":[],"sentiment":["0","100"],"location":[]}') {
      // Your code here
      $('#filter_on_off').text('OFF').removeClass('btn-success').addClass('btn-danger');
    } else {
      $('#filter_on_off').text('ON').removeClass('btn-danger').addClass('btn-success');
    }

    filteredData = globalData.filter(
      (tweet) =>
        (filter['gender'] == tweet['user']['gender'] || filter['gender'] === '') &&
        (tweet['content_wordlist'].some((word) => filter['keyword'].includes(word)) || filter['keyword'].length == 0) &&
        tweet['content_sentiment'] * 100 > filter['sentiment'][0] &&
        tweet['content_sentiment'] * 100 < filter['sentiment'][1] &&
        (filter['location'].includes(tweet['user']['location']) || filter['location'].length == 0)
    );
    drawDashboard(selectedTopic, year, month, filteredData);
  }

  let can_scroll = true;

  function drawDashboard(topic, year, month, data) {
    let TweetCountCanvas = document.getElementById('TweetCount');
    let genderCountCanvas = document.getElementById('GenderCount');
    let WordCountCanvas = document.getElementById('WordCount');
    let SentimentCanvas = document.getElementById('Sentiment');
    let GeoBarCanvas = document.getElementById('GeoBar');

    //console.log(data);

    //table
    var start = 0;
    var interval = 200;
    let counter = 0;
    let smallfillter = {
      username: '',
      created_at: '',
      content: '',
      location: '',
      gender: '',
    };

    $('#dataTable tbody').html('');
    tweetshow.scrollTop = 0;
    gen_tweet_table(start, start + interval, smallfillter);

    function gen_tweet_table(start, end, smallfillter) {
      //console.log(smallfillter);
      console.time('gen_tweet_table');
      let _filteredData;
      let finalData;
      //console.log(smallfillter);
      function tablefilter(data, smallfillter) {
        //console.log(smallfillter);
        let _filteredData = data.filter(
          (tweet) =>
            (tweet['user']['gender'] === smallfillter['gender'] || smallfillter['gender'] === '') &&
            (tweet['content'].toLowerCase().includes(smallfillter['content'].toLowerCase()) ||
              smallfillter['content'] == '') &&
            (tweet['user']['location'].includes(smallfillter['location']) || smallfillter['location'] == '') &&
            (tweet['created_at'].includes(smallfillter['created_at']) || smallfillter['created_at'] == '') &&
            (tweet['user']['nick_name'].includes(smallfillter['username']) || smallfillter['username'] == '')
        );
        return _filteredData;
      }

      if (smallfillter) {
        try {
          _filteredData = tablefilter(filteredData, smallfillter);
        } catch {
          _filteredData = tablefilter(globalData, smallfillter);
        }
      } else {
        _filteredData = data;
      }

      finalData = _filteredData;

      $('#table_username').val(smallfillter['username']);
      $('#table_gender').val(smallfillter['gender']);
      $('#table_location').val(smallfillter['location']);
      $('#table_content').val(smallfillter['content']);
      $('#table_created_at').val(smallfillter['created_at']);

      var table = document.getElementById('dataTable');
      //console.log(finalData.length, start);
      if (finalData.length < start) {
        can_scroll = false;
      } else {
        $('#datatablerow').html(`Row\n(${finalData.length})`);
        var html = finalData
          .slice(start, end)
          .map(function (tweet) {
            counter++;
            return (
              `<tr ondblclick="window.open('${tweet['url']}','_blank', 'height=900,width=900');">` +
              '<td>' +
              counter +
              '</td>' +
              '<td>' +
              tweet['user']['nick_name'] +
              '</td>' +
              '<td>' +
              tweet['user']['gender'] +
              '</td>' +
              '<td>' +
              tweet['user']['location'] +
              '</td>' +
              '<td>' +
              '<div style="overflow:auto;resize:vertical;width = 150px;height:50px; max-height:400px; min-height:50px">' +
              tweet['content'] +
              '</div>' +
              '</td>' +
              '<td>' +
              tweet['created_at'].replace('T', ' ').replace('Z', '') +
              '</td>' +
              '</tr>'
            );
          })
          .join('');
        table.tBodies[0].innerHTML += html;
      }

      console.timeEnd('gen_tweet_table');
    }

    $('#tweetshow').on('scroll', function () {
      if (!can_scroll) {
        return;
      }

      if (tweetshow.scrollTop + tweetshow.clientHeight >= tweetshow.scrollHeight - 0.5) {
        //console.log('Scrolled to the bottom');
        start += interval;

        gen_tweet_table(start, start + interval, smallfillter);
      }
    });

    //filter
    $('.tablefilter_item').on('blur', function () {
      $('#dataTable tbody').html('');
      tweetshow.scrollTop = 0;
      can_scroll = true;
      counter = 0;
      start = 0;

      smallfillter = {
        username: $('#table_username').val(),
        created_at: $('#table_created_at').val(),
        content: $('#table_content').val(),
        location: $('#table_location').val(),
        gender: $('#table_gender').val(),
      };
      gen_tweet_table(start, start + interval, smallfillter);
    });

    console.time('drawTweetCount');
    drawTweetCount(year, month, data);
    console.timeEnd('drawTweetCount');

    console.time('drawGenderCount');
    drawGenderCount(data);
    console.timeEnd('drawGenderCount');

    console.time('drawWordCount');
    drawWordCount(data);
    console.timeEnd('drawWordCount');

    console.time('drawSentiment');
    drawSentiment(data);
    console.timeEnd('drawSentiment');

    console.time('drawGeoCount');
    const [mapLabel, mapCount] = drawGeoCount(data);
    console.timeEnd('drawGeoCount');

    console.time('drawGeoMap');
    drawGeoMap(mapLabel, mapCount);
    console.timeEnd('drawGeoMap');

    console.time('drawiframeLda');
    drawiframeLda(topic, year, month);
    console.timeEnd('drawiframeLda');

    submit = 0;

    function drawTweetCount(year, month, data) {
      function dayCounts(year, month, data) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        let counts = {};
        for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
          let day = new Date(d);
          day.setHours(0, 0, 0, 0);
          counts[day] = 0;
        }
        data.map(function (tweet) {
          let date = new Date(tweet.created_at);
          date.setHours(0, 0, 0, 0);
          if (counts.hasOwnProperty(date)) {
            counts[date]++;
          }
        });
        let countsArray = Object.entries(counts);
        countsArray.sort((a, b) => new Date(a[0]) - new Date(b[0]));
        let labels = countsArray.map(([date, _]) => new Date(date).getDate());
        let count = countsArray.map(([_, count]) => count);
        return [labels, count];
      }
      function monthCounts(year, data) {
        let counts = {};
        for (let month = 0; month < 12; month++) {
          counts[month] = 0;
        }
        data.map((tweet) => {
          let date = new Date(tweet.created_at);
          if (date.getFullYear() === year) {
            counts[date.getMonth()]++;
          }
        });
        let labels = Object.keys(counts).map((key) => Number(key) + 1);
        let count = Object.values(counts);
        return [labels, count];
      }
      function yearCounts(data) {
        let counts = {};
        data.map((tweet) => {
          let date = new Date(tweet.created_at);
          let year = date.getFullYear();
          if (!counts[year]) {
            counts[year] = 0;
          }
          counts[year]++;
        });
        let labels = Object.keys(counts).map(Number);
        let count = Object.values(counts);
        return [labels, count];
      }
      var output;
      if (!year && !month) {
        output = yearCounts(data);
      } else if (year && !month) {
        output = monthCounts(year, data);
      } else {
        output = dayCounts(year, month, data);
      }
      let TweetCountData = {
        labels: output[0],
        datasets: [
          {
            label: 'Tweet',
            backgroundColor: 'rgba(75, 75, 255, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            data: output[1],
          },
        ],
      };
      if (window.TweetCountChart) {
        window.TweetCountChart.destroy();
      }
      window.TweetCountChart = new Chart(TweetCountCanvas, {
        type: 'bar',
        data: TweetCountData,
        options: {
          plugins: {
            title: {
              display: true,
              text: `Tweet Count (Total Tweet: ${data.length})`,
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Year/Month/Day',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Tweet Count',
              },
            },
          },
          responsive: true, // This will make the chart responsive
          maintainAspectRatio: false, // This will allow the chart to fit the width and height of its container
        },
      });
    }

    function drawGenderCount(data) {
      var mCount = 0;
      var fCount = 0;
      data.map((tweet) => {
        if (tweet.user.gender === 'm') {
          mCount++;
        } else if (tweet.user.gender === 'f') {
          fCount++;
        }
      });

      let genderCountData = {
        labels: ['M', 'F'],
        datasets: [
          {
            label: 'Gender',
            backgroundColor: ['blue', 'red'], // Set 'M' to blue and 'F' to red
            borderColor: 'white',
            data: [mCount, fCount],
          },
        ],
      };
      if (window.genderCountChart) {
        window.genderCountChart.destroy();
      }
      window.genderCountChart = new Chart(genderCountCanvas, {
        type: 'pie',
        data: genderCountData,
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Gender Ratio',
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  var label = context.label || '';
                  if (label) {
                    label += ': ';
                  }
                  var total = mCount + fCount;
                  var value = context.dataset.data[context.dataIndex];
                  if (value !== null) {
                    label +=
                      value + ' (' + new Intl.NumberFormat('en-US', { style: 'percent' }).format(value / total) + ')';
                  }
                  return label;
                },
              },
            },
          },
          responsive: true, // This will make the chart responsive
          maintainAspectRatio: false, // This will allow the chart to fit the width and height of its container
        },
      });
    }

    function drawWordCount(data) {
      var freqDict = new Map();
      data.map((tweet) => {
        tweet.content_wordlist.map((word) => {
          freqDict.set(word, (freqDict.get(word) || 0) + 1);
        });
      });

      // Convert the frequency dictionary to an array of [word, frequency] pairs
      var freqArray = Array.from(freqDict.entries());

      // Sort the array by frequency in descending order and slice the first 20 elements
      var mostFreqWords = freqArray.sort((a, b) => b[1] - a[1]).slice(0, 20);
      wordList = mostFreqWords;

      const select_word = $('#select_word');
      select_word.empty();
      wordList.map((key) => {
        const newOption = document.createElement('option');
        // Set the text content and value of the option
        newOption.textContent = key[0];
        newOption.value = key[0];
        if (filter['keyword'].includes(key[0])) {
          $(newOption).css('background-color', 'MistyRose');
        }
        select_word.append(newOption);
      });

      // Prepare the labels and data for the bar chart
      let labels = mostFreqWords.map(([word, freq]) => word);
      let count = mostFreqWords.map(([word, freq]) => freq);

      // The bar chart code
      let WordCountData = {
        labels: labels,
        datasets: [
          {
            label: 'Word Count',
            backgroundColor: 'rgba(75, 75, 255, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            data: count,
          },
        ],
      };
      if (window.WordCountChart) {
        window.WordCountChart.destroy();
      }
      window.WordCountChart = new Chart(WordCountCanvas, {
        type: 'bar',
        data: WordCountData,
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Word Count (TOP 20)',
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Words',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Count',
              },
            },
          },
          responsive: true, // This will make the chart responsive
          maintainAspectRatio: false, // This will allow the chart to fit the width and height of its container
        },
      });
    }

    function drawSentiment(data) {
      let { sum, count, negative, positive } = data.reduce(
        (acc, tweet) => {
          return {
            sum: acc.sum + tweet.content_sentiment,
            count: acc.count + 1,
            negative: acc.negative + (tweet.content_sentiment < 0.5 ? 1 : 0),
            positive: acc.positive + (tweet.content_sentiment >= 0.5 ? 1 : 0),
          };
        },
        { sum: 0, count: 0, negative: 0, positive: 0 }
      );

      let avg = sum / count;
      //console.log('The average sentiment score is: ' + avg);

      let SentimentData = {
        labels: ['Negative', 'Positive'],
        datasets: [
          {
            label: 'Sentiment',
            backgroundColor: ['red', 'green'],
            borderColor: 'white',
            data: [negative, positive],
          },
        ],
      };
      if (window.SentimentChart) {
        window.SentimentChart.destroy();
      }
      window.SentimentChart = new Chart(SentimentCanvas, {
        type: 'pie',
        data: SentimentData,
        options: {
          plugins: {
            title: {
              display: true,
              text: `Sentiment ratio (AVG:${avg.toFixed(2)})`,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  var label = context.label || '';
                  if (label) {
                    label += ': ';
                  }
                  var total = negative + positive;
                  var value = context.dataset.data[context.dataIndex];
                  if (value !== null) {
                    label +=
                      value + ' (' + new Intl.NumberFormat('en-US', { style: 'percent' }).format(value / total) + ')';
                  }
                  return label;
                },
              },
            },
          },
          responsive: true, // This will make the chart responsive
          maintainAspectRatio: false, // This will allow the chart to fit the width and height of its container
        },
      });
    }

    function drawGeoCount(data) {
      const locations = data.map((i) => i.user.location);
      let locationsCountDict = locations.reduce((acc, location) => {
        acc.set(location, (acc.get(location) || 0) + 1);
        return acc;
      }, new Map());

      // Convert the frequency dictionary to an array of [word, frequency] pairs
      let freqArray = Array.from(locationsCountDict.entries());

      // Sort the array by frequency in descending order and slice the first 20 elements
      let mostFreqLocation = freqArray.sort((a, b) => b[1] - a[1]);

      if (submit) {
        locationList = mostFreqLocation;
      }

      const selectLocation = $('#select_location');
      selectLocation.empty();
      locationList.map((key) => {
        const newOption = document.createElement('option');
        // Set the text content and value of the option
        newOption.textContent = key[0];
        newOption.value = key[0];
        // //console.log(filter['location'], key[0]);
        // //console.log(filter['location'].includes(key[0]));

        if (filter['location'].includes(key[0])) {
          $(newOption).css('background-color', 'MistyRose');
        }
        selectLocation.append(newOption);
      });

      // Prepare the labels and data for the bar chart
      const mapLabel = mostFreqLocation.map(([location, freq]) => location);
      const mapCount = mostFreqLocation.map(([word, freq]) => freq);

      // The bar chart code
      let GeoCountData = {
        labels: mapLabel.slice(0, 20),
        datasets: [
          {
            label: 'Location Count',
            backgroundColor: 'rgba(75, 75, 255, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            data: mapCount.slice(0, 20),
          },
        ],
      };
      if (window.GeoBarChart) {
        window.GeoBarChart.destroy();
      }
      window.GeoBarChart = new Chart(GeoBarCanvas, {
        type: 'bar',
        data: GeoCountData,
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Location Freq (TOP 20)',
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Locations',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Count',
              },
            },
          },
          responsive: true, // This will make the chart responsive
          maintainAspectRatio: false, // This will allow the chart to fit the width and height of its container
        },
      });
      return [mapLabel, mapCount];
    }
    function drawGeoMap(locations, count) {
      const locationsCountMap = locations.reduce(
        (acc, location, index) => {
          const province = location.split(' ')[0];
          const provincecode = provinceToCode[province];
          acc.set(provincecode, (acc.get(provincecode) || 0) + count[index]);
          return acc;
        },
        new Map(Object.values(provinceToCode).map((value) => [value, 0]))
      );
      const maxlocFreq = Array.from(locationsCountMap.entries()).reduce((max, entry) =>
        max[1] > entry[1] ? max : entry
      );
      function refreshMap() {
        // Example color scale function

        function getColorByValue(highest_value, value) {
          if (value == 0) {
            return '#ffffff';
          }
          // Normalize the value to a range between 0 and 1
          const normalizedValue = value / highest_value;

          // Define start and end colors in RGB
          const endColor = { r: 255, g: 0, b: 0 };
          const startColor = { r: 255, g: 255, b: 230 };

          // Linearly interpolate the color components
          const r = Math.round(startColor.r + (endColor.r - startColor.r) * normalizedValue);
          const g = Math.round(startColor.g + (endColor.g - startColor.g) * normalizedValue);
          const b = Math.round(startColor.b + (endColor.b - startColor.b) * normalizedValue);

          // Return the interpolated color in hex format
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
            .toString(16)
            .padStart(2, '0')}`;
        }
        function getKeyByValue(object, value) {
          return Object.keys(object).find((key) => object[key] === value);
        }
        let svgUrl = 'china.svg';
        let cacheBuster = '?' + new Date().getTime(); // Use a timestamp as the cache-buster
        $('#GeoMap').attr('src', svgUrl + cacheBuster);

        $('#GeoMap').on('load', function () {
          let svgDoc = $('#GeoMap')[0].getSVGDocument(); // 获取 SVG 文档

          for (let [key, value] of locationsCountMap.entries()) {
            const pathElement = svgDoc.getElementById(key);
            if (!pathElement) {
              console.warn(`Element with id ${key} not found`);
              continue;
            }
            if (key == 'other' || key == 'oversea') {
              $(pathElement).text(`${getKeyByValue(provinceToCode, key)}:${value}`);
              continue;
            }

            const fillColor = getColorByValue(maxlocFreq[1], value);
            $(pathElement).css({
              fill: fillColor,
              stroke: 'black',
              'stroke-width': '1px',
            });

            // 创建并设置 <title> 元素
            const titleElement = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            titleElement.textContent = `${getKeyByValue(provinceToCode, key)}:${value}`;
            pathElement.appendChild(titleElement);
          }
        });
      }
      $('#GeoMap').on('load', refreshMap());
    }

    $('iframe').on('load', function () {
      var iframeBody = $(this).contents().find('body');
      iframeBody.children(':first').css({
        display: 'grid' /* Establishes the outer div as a flex container */,
        'place-items':
          'center' /* Shorthand for align-items and justify-items, centers children both vertically and horizontally */,
        'grid-template-columns': '1fr' /* Defines one column taking full width */,
        'grid-template-rows': 'auto' /* Defines row height to be determined by the content */,
      });
      $('#warp').show();
    });

    function drawiframeLda(topic, year, month) {
      year = year === undefined ? 'None' : year;
      month = month === undefined ? 'None' : month;

      fetch(`/db/ldaresult/${topic}/${year}/${month}`)
        .then((response) => response.json())
        .then((data) => {
          // //console.log('Data received:', data['data']);
          const lda_json = data['data']['lda_json'];
          $('iframe').prop('srcdoc', lda_json);
          // Process your data here
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          $('iframe').prop('srcdoc', 'LDA analysis is not avaliable!');

          // alert('The LDA analysis is not available yet!');
          // Handle your error here
        });
    }
  }
});
