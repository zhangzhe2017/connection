package weixin.zoo.service;

import com.alibaba.fastjson.JSONObject;
import weixin.zoo.infrastructure.model.TemplateField;

import java.util.List;

/**
 * Created by viczhang.zhangz on 2017/5/3.
 */
public interface TemplateService {
    /*
     * 根据模板id获取模板信息
     */
    public JSONObject getTemplate(long id);

    /*
     * 保存投票&问卷数据
     */
    public Long saveVote(String type, String name, String fields, String wxid);
}
