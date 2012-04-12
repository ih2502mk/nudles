/*
Первая итерация.
Страница с двумя контейнерами:
- контейнер со списком пользователей
- контейнер со списком статей
Цель определится с внешним видом реестра и контекста.
*/

var registry = {
};

var pages = [
  {
    path: "/",
    container: "homePage"
  }
]

var containers = {
  "homePage" : {
    filler: withNestedContainers,
    nested: [
      "usersList",
      "postsList"
    ]
  },
  "usrsList" : {
    filler: fetchUsersList,
    nested: [
      ["userListItem"],
      "userListPager"
    ]
  },
  "postsList" : {
    filler: fetchPostsList,
    nested: [
      ["postItem"],
      
    ]
  }
  
}

var fetchUsersList = function() {
}