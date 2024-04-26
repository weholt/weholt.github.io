from invoke import task

@task
def publish(c, comment: str = "No comment."):
    c.run("git add .")
    c.run(f'git commit -m "{comment}"')
    c.run("git push")