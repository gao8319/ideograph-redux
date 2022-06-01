import java.io.*

val confName = "databaseConfiguration.json"

File("./dist/index.html").let { f ->
    val replaced = f.readLines().map {
        it.replace("/assets/", "assets/")
    }.joinToString("\n")
    f.writeText(replaced)
}

val staticFolder = File("./dist/static/")
staticFolder.mkdir()

File("./static/$confName").copyTo(
    File("./dist/static/$confName"), true
)