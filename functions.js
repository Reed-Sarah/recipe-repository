function buildRecipeList(recipes) {
    let list = "<ul>";
    recipes.forEach(recipe => {
        list += "<a href='/recipe?id=" + recipe["recipe_id"] + "'>"
        list += "<li>";
        list += recipe["recipe_title"];
        list += "</li></a>";
    });
    list += "</ul>";
    console.log(list)
    return list;
}

module.exports = {
    buildRecipeList: buildRecipeList
}