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


File("./dist/test.html").writeText("""<script>window.addEventListener("message", ev=>console.log(ev.data))</script>   <iframe src="index.html" width="1440" height="800"></iframe>""")