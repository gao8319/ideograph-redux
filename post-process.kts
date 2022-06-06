import java.io.*

val confNames = listOf(
    "databaseConfiguration.json",
    "apiConfiguration.json"
)

File("./dist/index.html").let { f ->
    val replaced = f.readLines().map {
        it.replace("/assets/", "assets/")
    }.joinToString("\n")
    f.writeText(replaced)
}

val staticFolder = File("./dist/static/")
staticFolder.mkdir()

confNames.forEach {
    File("./static/$it").copyTo(
        File("./dist/static/$it"), true
    )
}