import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import Task from "App/Models/Task";
import { reporters } from "tests/bootstrap";

export default class TasksController {
  public async index({ request, response }: HttpContextContract) {
    const tasks = await Task.query();

    if (tasks.length === 0) {
      return response.status(404).json({ error: "Tasks not found" });
    }

    return response.status(200).json({ tasks });
  }

  public async store({ request, response }: HttpContextContract) {
    //const { title, description } = request.only(["title", "description"]);
    const taskSchema = schema.create({
      title: schema.string({ trim: true }, [
        rules.maxLength(255),
        rules.minLength(1),
      ]),
      description: schema.string({ trim: true }, [
        rules.maxLength(1024),
        rules.minLength(1),
      ]),
    });

    const data = await request.validate({ schema: taskSchema });
    const task = await Task.create(data);

    return response.status(200).json(task);
  }

  public async show({ request, response }: HttpContextContract) {
    const task = await Task.query().where("id", request.param("id")).first();

    if (!task) {
      return response.status(404).json({ error: "Task not found" });
    }

    return response.status(200).json({ task });
  }

  public async update({ request, response }: HttpContextContract) {
    const task = await Task.query().where("id", request.param("id")).first();

    if (!task) {
      return response.status(404).json({ error: "Task not found" });
    }

    const taskSchema = schema.create({
      title: schema.string.optional({ trim: true }, [
        rules.maxLength(255),
        rules.minLength(1),
      ]),
      description: schema.string.optional({ trim: true }, [
        rules.maxLength(1024),
        rules.minLength(1),
      ]),
    });

    const payload = await request.validate({ schema: taskSchema });

    if (payload.title) {
      task.title = payload.title;
    }

    if (payload.description) {
      task.description = payload.description;
    }

    await task.save();
    return response.status(200).json(task);
  }

  public async destroy({ request, response }: HttpContextContract) {
    const task = await Task.query().where("id", request.param("id")).first();

    if (!task) {
      return response.status(404).json({ error: "Taks does not exists" });
    }

    await task.delete();
    return response.json({ message: "Task successfully deleted" });
  }
}
