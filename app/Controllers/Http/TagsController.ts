import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import Tag from "App/Models/Tag";

export default class TagsController {
  public async index({ response }: HttpContextContract) {
    const tags = await Tag.query();

    if (!tags)
      return response.status(404).json({ error: "There are no tags found" });

    return response.status(200).json(tags);
  }

  public async store({ request, response }: HttpContextContract) {
    const tagSchema = schema.create({
      name: schema.string({ trim: true }, [
        rules.minLength(1),
        rules.maxLength(255),
      ]),
    });

    const data = await request.validate({ schema: tagSchema });
    const tag = await Tag.create(data);

    return response.status(200).json(tag);
  }

  public async show({ request, response }: HttpContextContract) {
    const tag = await Tag.query().where("id", request.param("id")).first();

    if (!tag)
      return response.status(404).json({ error: "Tag does not exists" });

    return response.status(200).json(tag);
  }

  public async update({ request, response }: HttpContextContract) {
    const tag = await Tag.query().where("id", request.param("id")).first();
    const tagSchema = schema.create({
      name: schema.string.optional({ trim: true }, [
        rules.minLength(1),
        rules.maxLength(2048),
      ]),
    });

    if (!tag) return response.status(404).json({ error: "Tag does not exist" });

    const payload = await request.validate({ schema: tagSchema });

    if (payload.name) tag.name = payload.name;

    await tag.save();
    return response.status(200).json(tag);
  }

  public async destroy({ request, response }: HttpContextContract) {
    const tag = await Tag.query().where("id", request.param("id")).first();

    if (!tag)
      return response.status(404).json({ error: "Tag does not exists" });

    await tag.delete();
    return response.status(200).json({ message: "Tag successfully deleted" });
  }
}
